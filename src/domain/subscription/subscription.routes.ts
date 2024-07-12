import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import SubscriptionController from './subscription.controller';
import authAdminGuard from '../auth/middleware/guard/auth.admin.guard';
import authGuard from '../auth/middleware/guard/auth.guard';

class SubscriptionRouter extends AbstractRouter {
  private readonly subscrRouter: Router;
  private readonly subscrController: SubscriptionController;

  constructor() {
    super();
    this.subscrRouter = express.Router();
    this.subscrController = dependencyContainer.getInstance<SubscriptionController>('subscrController');
    this.setupRouter();
  }

  public override getRouter(): Router {
    return this.subscrRouter;
  }

  protected override setupRouter(): void {
    this.subscrRouter.use('/public', authGuard);
    this.subscrRouter.post(
      '/public', (...args) => this.subscrController.createSubscriptionAsSubscriber(...args)
    );
    this.subscrRouter.get(
      '/public/:subscriptionType', (...args) => this.subscrController.getAllSubscriptions(...args)
    );
    this.subscrRouter.get(
      '/public/:subscriptionType/:subscriptionId', (...args) => this.subscrController.getSubscriptionById(...args)
    );
    this.subscrRouter.delete(
      '/public/:subscriptionType/:subscriptionId',
      (...args) => this.subscrController.deleteSubscriptionById(...args)
    );

    this.subscrRouter.use('/admin', authAdminGuard);
    this.subscrRouter.patch(
      '/admin/:subscriptionId', (...args) => this.subscrController.updateSubscriptionById(...args)
    );
  }
}
export default SubscriptionRouter;
