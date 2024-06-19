import express, { Router } from 'express';
import dependencyContainer from '../../dependencyInjection/dependency.container';
import UserController from './user.controller';
import authGuard from '../../auth/auth.guard';

class UserRouter {
  private readonly userRouter: Router;
  private readonly userController: UserController;

  constructor() {
    this.userRouter = express.Router();
    this.userController = dependencyContainer.getInstance<UserController>('userController');
    this.setupUserRouter();
  }

  public getUserRouter(): Router {
    return this.userRouter;
  }

  private setupUserRouter(): void {
    this.userRouter.get('/', (...args) => this.userController.getAllUsers(...args));
    this.userRouter.use(authGuard);
    this.userRouter.get('/:id', (...args) => this.userController.getUserById(...args));
    this.userRouter.put('/:id', (...args) => this.userController.updateUserById(...args));
    this.userRouter.patch('/:id', (...args) => this.userController.updateUserById(...args));
    this.userRouter.delete('/:id', (...args) => this.userController.deleteUserById(...args));
  }
}
export default UserRouter;
