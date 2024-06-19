import { NextFunction, Request, Response } from 'express';
import { CookieOptions } from 'express';
import MailerTransporter from '../mailer/mailer.transporter';
import UserController from '../domain/user/user.controller';
import CryptoProvider from '../crypto/crypto.provider';

class AuthController {
  constructor(
    private readonly mailerTransporter: MailerTransporter,
    private readonly cryptoProvider: CryptoProvider,
    private readonly userController: UserController,
    private readonly cookieConfig: CookieOptions
  ) { }

  public async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userController.getUserByEmail(req);
      const userPassword = req.query.userPassword as string;
      const hashUserPassword = await this.cryptoProvider.hashStringBySHA256(userPassword);

      if (user.dataValues.password !== hashUserPassword) {
        return res.status(401).send('Unauthorized - incorrect password');
      }

      req.session.userId = user.dataValues.id;
      return res.status(200).json({ status: 200, data: user, message: "Authorization was successful" });
    }
    catch (err) {
      next(err);
    }
  }

  public async signup(req: Request, res: Response, next: NextFunction) {
    try {
      this.userController.isReqUserDataCreateValid(req, res);

      const userDataCreate = req.body;
      const verificationToken: string = this.cryptoProvider.generateSecureVerificationToken();
      const verLink = process.env.CUR_URL + `/auth/signup/verify?token=${verificationToken}`;

      await this.mailerTransporter.sendMailByTransporter({
        to: userDataCreate.email,
        subject: 'Verify your email',
        html: `<p>Hello, it's Daccord Service) We are glad to welcome you as a user of our application!</p><br>
        <p>Please confirm your email by clicking on the link: <a href="${verLink}">Verify Email</a></p>`
      });

      res.cookie('authToken', verificationToken, this.cookieConfig);
      res.cookie('userDataCreate', userDataCreate, this.cookieConfig);

      return res.status(200).send(`Email successfully sent to ${userDataCreate.email}`);
    }
    catch (err) {
      next(err);
    }
  }

  public logout(req: Request, res: Response, next: NextFunction) {
    try {
      req.session.destroy(() => {
        return res.status(200).json({ status: 200, message: "Logged out successfully" });
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      if (
        !req.cookies || !req.cookies['authToken'] || !req.cookies['userDataCreate'] ||
        req.cookies['authToken'] !== token
      ) {
        return res.status(422).send(
          "Account has not been verified! The token didn't match or has expired. Return to the registration page and try to register again."
        );
      }

      await this.userController.createUser(req.cookies['userDataCreate']);
      return res.redirect(process.env.CUR_URL + '/api');
    }
    catch (err) {
      next(err);
    }
  }
}
export default AuthController;
