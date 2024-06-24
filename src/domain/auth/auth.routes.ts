import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import AuthController from './auth.controller';
import authGuard from './auth.guard';

class AuthRouter extends AbstractRouter {
  private readonly authRouter: Router;
  private readonly authController: AuthController;

  constructor() {
    super();
    this.authRouter = express.Router();
    this.authController = dependencyContainer.getInstance<AuthController>('authController');
    this.setupRouter();
  }

  public override getRouter(): Router {
    return this.authRouter;
  }

  protected override setupRouter(): void {
    this.authRouter.post('/signin', (...args) => this.authController.signin(...args));
    this.authRouter.post('/signup', (...args) => this.authController.signup(...args));
    this.authRouter.get('/signup/verify', (...args) => this.authController.verifyEmail(...args));
    this.authRouter.use(authGuard);
    this.authRouter.get('/logout', (...args) => this.authController.logout(...args));
  }
}
export default AuthRouter;
