import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import UserRouter from './routes/user.routes';
import UserContactRouter from './routes/user.contact.routes';
import UserController from './controller/user.controller';
import UserUpdateController from './controller/user.update.controller';
import UserContactController from './controller/user.contact.controller';
import UserService from './service/user.service';
import UserContactService from './service/user.contact.service';
import MailerTransporter from '../../utils/lib/mailer/mailer.transporter';
import CryptoProvider from '../../utils/lib/crypto/crypto.provider';
import JWTStrategy from '../../utils/lib/jwt/jwt.strategy';

class UserModule {
  private readonly userController: UserController;
  private readonly userUpdateController: UserUpdateController
  private readonly userContactController: UserContactController;

  private readonly userService: UserService;
  private readonly userContactService: UserContactService;

  constructor() {
    this.userService = new UserService();
    this.userContactService = new UserContactService();
    this.userContactController = new UserContactController(this.userContactService);

    this.userUpdateController = new UserUpdateController(
      this.userService,
      this.userContactService,
      dependencyContainer.getInstance<MailerTransporter>('mailerTransporter'),
      dependencyContainer.getInstance<CryptoProvider>('cryptoProvider'),
      dependencyContainer.getInstance<JWTStrategy>('jwtStrategy')
    );

    this.userController = new UserController(
      this.userService,
      dependencyContainer.getInstance<CryptoProvider>('cryptoProvider')
    );

    dependencyContainer.registerInstance('userService', this.userService);
    dependencyContainer.registerInstance('userController', this.userController);
    dependencyContainer.registerInstance('userUpdateController', this.userUpdateController);
    dependencyContainer.registerInstance('userContactService', this.userContactService);
    dependencyContainer.registerInstance('userContactController', this.userContactController);
    dependencyContainer.registerInstance('userRouter', new UserRouter());
    dependencyContainer.registerInstance('userContactRouter', new UserContactRouter());
  }
}
export default UserModule;
