import dependencyContainer from '../../dependencyInjection/dependency.container';
import UserRouter from './user.routes';
import UserController from './user.controller';
import UserService from './user.service';

class UserModule {
  private readonly userController: UserController;
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.userController = new UserController(this.userService);
    dependencyContainer.registerInstance('userService', this.userService);
    dependencyContainer.registerInstance('userController', this.userController);
    dependencyContainer.registerInstance('userRouter', new UserRouter());
  }
}
export default UserModule;
