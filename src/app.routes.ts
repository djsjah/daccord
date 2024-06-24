import express, { Router } from 'express';
import dependencyContainer from './utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from './app.routes.abstract';
import AppController from './app.controller';

class AppRouter extends AbstractRouter {
  private readonly appRouter: Router;
  private readonly appController: AppController;

  constructor() {
    super();
    this.appRouter = express.Router();
    this.appController = dependencyContainer.getInstance<AppController>('appController');
    this.setupRouter();
  }

  public override getRouter(): Router {
    return this.appRouter;
  }

  protected override setupRouter(): void {
    this.appRouter.get('/', this.appController.renderMainPage);
  }
}
export default AppRouter;
