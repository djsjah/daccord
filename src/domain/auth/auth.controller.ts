import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import UserAuthSchema from './validation/schema/user.auth.schema';
import UserRegisterSchema from './validation/schema/user.register.schema';
import MailerTransporter from '../../utils/lib/mailer/mailer.transporter';
import UserService from '../user/service/user.service';
import CryptoProvider from '../../utils/lib/crypto/crypto.provider';

class AuthController {
  constructor(
    private readonly mailerTransporter: MailerTransporter,
    private readonly cryptoProvider: CryptoProvider,
    private readonly userService: UserService
  ) { }

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

      req.session.userId = user.dataValues.id;
      return res.status(200).json({ status: 200, data: user, message: "Authorization was successful" });
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

      const newUser = await this.userService.createUser(userDataRegister);
      const verLink = process.env.CUR_URL + `/auth/signup/verify?token=${newUser.id}`;

      await this.mailerTransporter.sendMailByTransporter({
        to: userDataRegister.email,
        subject: 'Verify your email',
        html: `<p>Hello, it's Daccord Service) We are glad to welcome you as a user of our application!</p><br>
        <p>Please confirm your email by clicking on the link: <a href="${verLink}">Verify Email</a></p>`
      });

      return res.status(200).send(`Email successfully sent to ${userDataRegister.email}`);
    }
    catch (err) {
      next(err);
    }
  }

  public logout(req: Request, res: Response, next: NextFunction): Response | void {
    try {
      req.session.destroy(() => {
        return res.status(200).json({ status: 200, message: "Logged out successfully" });
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { token } = req.query;
      const user = await this.userService.getUserById(token as string, true);

      if (user.isActivated) {
        return res.status(422).send(
          "Account has not been verified! Most likely the token didn't match. Return to the registration page and try to register again"
        );
      }

      await this.userService.updateUserById(user.id, {
        name: user.name,
        role: user.role as 'admin' | 'user',
        email: user.email,
        password: user.password,
        isActivated: true,
        rating: user.rating
      }, true);

      return res.redirect(process.env.CUR_URL + '/api');
    }
    catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        return res.status(404).send(
          "Account has not been verified! The token has expired. Return to the registration page and try to register again"
        );
      }

      next(err);
    }
  }
}
export default AuthController;
