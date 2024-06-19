import express, { Router } from 'express';
import dependencyContainer from '../dependencyInjection/dependency.container';
import AuthController from './auth.controller';
import authGuard from './auth.guard';

class AuthRouter {
  private readonly authRouter: Router;
  private readonly authController: AuthController;

  constructor() {
    this.authRouter = express.Router();
    this.authController = dependencyContainer.getInstance<AuthController>('authController');
    this.setupAuthRouter();
  }

  public getAuthRouter(): Router {
    return this.authRouter;
  }

  private setupAuthRouter(): void {
    this.authRouter.get('/signin', (...args) => this.authController.signin(...args));
    this.authRouter.get('/signup/verify', (...args) => this.authController.verifyEmail(...args));
    this.authRouter.post('/signup', (...args) => this.authController.signup(...args));
    this.authRouter.use(authGuard);
    this.authRouter.get('/logout', (...args) => this.authController.logout(...args));
  }
}
export default AuthRouter;
