import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import DomainController from '../domain.controller.abstract';
import IUserPayload from './validation/interface/user.payload.interface';
import UserAuthSchema from './validation/schema/user.auth.schema';
import UserRegisterSchema from './validation/schema/user.register.schema';
import MailerTransporter from '../../utils/lib/mailer/mailer.transporter';
import UserService from '../user/service/user.service';
import CryptoProvider from '../../utils/lib/crypto/crypto.provider';
import JWTStrategy from '../../utils/lib/jwt/jwt.strategy';

class AuthController extends DomainController {
  constructor(
    private readonly mailerTransporter: MailerTransporter,
    private readonly cryptoProvider: CryptoProvider,
    private readonly jwtStrategy: JWTStrategy,
    private readonly userService: UserService
  ) {
    super();
  }

  public getUserPayload(req: Request, res: Response, next: NextFunction): Response {
    const user = req.user;

    if (user) {
      return res.status(200).json({
        status: 200,
        data: {
          name: user.name,
          role: user.role,
          email: user.email
        },
        message: "User details"
      });
    }

    return res.status(204).end();
  }

  public async signin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userDataAuth = req.body;
      const { error } = UserAuthSchema.validate(userDataAuth);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = await this.userService.getUserByEmail(req.body.email);
      const userPassword = req.body.password;
      const hashUserPassword = await this.cryptoProvider.hashStringBySHA256(userPassword);

      if (user.dataValues.password !== hashUserPassword) {
        return res.status(401).send("Unauthorized - incorrect email or password");
      }

      const userPayload: IUserPayload = {
        id: user.dataValues.id,
        name: user.dataValues.name,
        email: user.dataValues.email,
        role: user.dataValues.role
      };

      const accessToken = this.jwtStrategy.createAccessToken(userPayload);
      const refreshToken = this.jwtStrategy.createRefreshToken(userPayload);

      await this.userService.updateUserAuthData(user, {
        refreshToken: refreshToken
      });

      return res.status(200)
        .cookie('access-token', accessToken, {
          httpOnly: true,
          secure: false,
          maxAge: 900000
        })
        .cookie('refresh-token', refreshToken, {
          httpOnly: true,
          secure: false,
          maxAge: 259200000
        })
        .json({
          status: 200,
          data: {
            name: user.name,
            email: user.email
          },
          message: "Authorization was successful"
        });
    }
    catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        return res.status(401).send("Unauthorized - incorrect email or password");
      }

      next(err);
    }
  }

  public async signup(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userDataRegister = req.body;
      const { error } = UserRegisterSchema.validate(userDataRegister);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const verifToken = this.cryptoProvider.generateSecureVerificationToken();
      const verifLink = process.env.CUR_URL + `/auth/signup/verifyUserEmail?token=${verifToken}`;
      userDataRegister.password = await this.cryptoProvider.hashStringBySHA256(userDataRegister.password);

      await this.userService.createUser({
        ...userDataRegister,
        verifToken: verifToken
      });

      await this.mailerTransporter.sendMailByTransporter({
        to: userDataRegister.email,
        subject: 'Verify your email',
        html: `<p>Hello, it's <strong>Daccord Service!</strong> We are glad to welcome you as a user of our application!</p><br>
        <p>Please confirm your email by clicking on the link: <strong><a style="text-decoration: underline;" href="${verifLink}">Activate your account</a></strong></p>`
      });

      return res.status(200).send(`Email successfully sent to ${userDataRegister.email}`);
    }
    catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id as string;
      const user = await this.userService.getUserById(userId, false);
      await this.userService.updateUserAuthData(user, {
        refreshToken: null
      });

      if (req.cookies['refresh-token']) {
        res.clearCookie('refresh-token');
      }

      res.clearCookie('access-token');
    }
    catch (err) {
      next(err);
    }

    return res.status(200).json({ status: 200, message: "Logged out successfully" });
  }

  public override async verifyUserEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { token } = req.query;
      const user = await this.userService.getUserByVerifToken(token as string);

      if (user.role === 'admin') {
        const verifAdminToken = this.cryptoProvider.generateSecureVerificationToken();
        const verifAdminLink = process.env.CUR_URL + `/auth/signup/verifyAdminRole?token=${verifAdminToken}`;

        await this.userService.updateUserAuthData(user, {
          isActivated: user.isActivated,
          verifToken: verifAdminToken
        });

        await this.mailerTransporter.sendMailByTransporter({
          to: process.env.ADMIN_EMAIL,
          subject: 'Confirm new admin',
          html: `<p>Hello, it's <strong>Daccord Service!</strong> A new user tries to register as admin with the following details:</p><br>
          <p>Email: ${user.email}</p>
          <p>Name: ${user.name}</p><br>
          <p>If you really approved this admin, please activate his account: <strong><a style="text-decoration: underline;" href="${verifAdminLink}">Activate user account</a></strong></p>`
        });
      }
      else {
        await this.userService.updateUserAuthData(user, {
          isActivated: true,
          verifToken: null
        });
      }

      return res.redirect(process.env.CUR_URL + '/api');
    }
    catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        return res.status(401).send(
          "Account has not been verified! Return to the registration page and try to register again"
        );
      }

      next(err);
    }
  }

  public async verifyAdminRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      const user = await this.userService.getUserByVerifToken(token as string);

      await this.userService.updateUserAuthData(user, {
        isActivated: true,
        verifToken: null
      });

      await this.mailerTransporter.sendMailByTransporter({
        to: user.email,
        subject: 'The role of admin',
        html: `<p>Hello, it's <strong>Daccord Service!</strong> Your role of the admin was confirmed! You can go to the main page and sign in as an admin:</p><br>
        <p><strong><a style="text-decoration: underline;" href="${process.env.CUR_URL + '/api'}">Signin as admin</a></strong></p>`
      });

      return res.status(200).json({
        status: 200,
        message: "Admin successfully created"
      });
    }
    catch (err) {
      next(err);
    }
  }
}
export default AuthController;
