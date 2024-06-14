import express, { Router } from 'express';
import dependencyContainer from '../../dependencyInjection/dependency.container';
import UserController from './user.controller';

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
    this.userRouter.get('/:id', (...args) => this.userController.getUserById(...args));
    this.userRouter.post('/', (...args) => this.userController.createUser(...args));
  }
}
export default UserRouter;
