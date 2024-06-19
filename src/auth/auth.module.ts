import { CookieOptions } from 'express';
import dependencyContainer from '../dependencyInjection/dependency.container';
import AuthRouter from './auth.routes';
import AuthController from './auth.controller';
import UserController from '../domain/user/user.controller';
import MailerTransporter from '../mailer/mailer.transporter';
import CryptoProvider from '../crypto/crypto.provider';

class AuthModule {
  constructor(cookieConfig: CookieOptions) {
    dependencyContainer.registerInstance('authController', new AuthController(
      dependencyContainer.getInstance<MailerTransporter>('mailerTransporter'),
      dependencyContainer.getInstance<CryptoProvider>('cryptoProvider'),
      dependencyContainer.getInstance<UserController>('userController'),
      cookieConfig
    ));

    dependencyContainer.registerInstance('authRouter', new AuthRouter());
  }
}
export default AuthModule;
