import express, { Router } from 'express';
import dependencyContainer from '../../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../../app.routes.abstract';
import UserController from '../controller/user.controller';
import authGuard from '../../auth/middleware/guard/auth.guard';
import authAdminGuard from '../../auth/middleware/guard/auth.admin.guard';

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
    this.userRouter.get('/verifyUserEmail', (...args) => this.userController.verifyUserEmail(...args));

    this.userRouter.use(authGuard);
    this.userRouter.patch('/', (...args) => this.userController.updateUser(...args));

    this.userRouter.use('/admin', authAdminGuard);
    this.userRouter.get('/admin', (...args) => this.userController.getAllUsers(...args));
    this.userRouter.get('/admin/:userId', (...args) => this.userController.getUserById(...args));
    this.userRouter.patch('/admin/:userId', (...args) => this.userController.updateUserById(...args));
    this.userRouter.delete('/admin/:userId', (...args) => this.userController.deleteUserById(...args));
  }
}
export default UserRouter;
