import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AuthRouter from './auth.routes';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import MailerTransporter from '../../utils/lib/mailer/mailer.transporter';
import CryptoProvider from '../../utils/lib/crypto/crypto.provider';
import JWTStrategy from '../../utils/lib/jwt/jwt.strategy';
import UserService from '../user/service/user.service';

class AuthModule {
  constructor() {
    dependencyContainer.registerInstance('authController', new AuthController(
      dependencyContainer.getInstance<MailerTransporter>('mailerTransporter'),
      dependencyContainer.getInstance<CryptoProvider>('cryptoProvider'),
      dependencyContainer.getInstance<JWTStrategy>('jwtStrategy'),
      dependencyContainer.getInstance<UserService>('userService')
    ));

    dependencyContainer.registerInstance('authRouter', new AuthRouter());
    dependencyContainer.registerInstance('authService', new AuthService(
      dependencyContainer.getInstance<UserService>('userService')
    ));
  }
}
export default AuthModule;
