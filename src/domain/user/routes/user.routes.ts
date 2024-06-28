import express, { Router } from 'express';
import dependencyContainer from '../../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../../app.routes.abstract';
import UserController from '../controller/user.controller';
import authGuard from '../../auth/guard/auth.guard';
import authAdminGuard from '../../auth/guard/auth.admin.guard';

class UserRouter extends AbstractRouter {
  private readonly userRouter: Router;
  private readonly userController: UserController;

  constructor() {
    super();
    this.userRouter = express.Router();
    this.userController = dependencyContainer.getInstance<UserController>('userController');
    this.setupRouter();
  }

  public override getRouter(): Router {
    return this.userRouter;
  }

  protected override setupRouter(): void {
    this.userRouter.use(authAdminGuard);
    this.userRouter.get('/', (...args) => this.userController.getAllUsers(...args));
    this.userRouter.get('/:userId', (...args) => this.userController.getUserById(...args));
    this.userRouter.put('/:userId', (...args) => this.userController.updateUserById(...args));
    this.userRouter.patch('/:userId', (...args) => this.userController.updateUserById(...args));
    this.userRouter.delete('/:userId', (...args) => this.userController.deleteUserById(...args));
  }
}
export default UserRouter;
