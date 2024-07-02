import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import UserRouter from './routes/user.routes';
import UserContactRouter from './routes/user.contact.routes';
import UserController from './controller/user.controller';
import UserContactController from './controller/user.contact.controller';
import UserService from './service/user.service';
import UserContactService from './service/user.contact.service';
import MailerTransporter from '../../utils/lib/mailer/mailer.transporter';
import CryptoProvider from '../../utils/lib/crypto/crypto.provider';

class UserModule {
  private readonly userController: UserController;
  private readonly userContactController: UserContactController;

  private readonly userService: UserService;
  private readonly userContactService: UserContactService;


  constructor() {
    this.userService = new UserService();
    this.userContactService = new UserContactService();

    this.userController = new UserController(
      this.userService,
      this.userContactService,
      dependencyContainer.getInstance<MailerTransporter>('mailerTransporter'),
      dependencyContainer.getInstance<CryptoProvider>('cryptoProvider')
    );

    this.userContactController = new UserContactController(this.userContactService);

    dependencyContainer.registerInstance('userService', this.userService);
    dependencyContainer.registerInstance('userController', this.userController);
    dependencyContainer.registerInstance('userContactService', this.userContactService);
    dependencyContainer.registerInstance('userContactController', this.userContactController);
    dependencyContainer.registerInstance('userRouter', new UserRouter());
    dependencyContainer.registerInstance('userContactRouter', new UserContactRouter());
  }
}
export default UserModule;
