import express, { Router } from 'express';
import dependencyContainer from './dependencyInjection/dependency.container';
import AppController from './app.controller';

class AppRouter {
  private readonly appRouter: Router;
  private readonly appController: AppController;

  constructor() {
    this.appRouter = express.Router();
    this.appController = dependencyContainer.getInstance<AppController>('appController');
    this.setupAppRouter();
  }

  public getAppRouter(): Router {
    return this.appRouter;
  }

  private setupAppRouter(): void {
    this.appRouter.get('/', this.appController.getMainPage);
  }
}
export default AppRouter;
