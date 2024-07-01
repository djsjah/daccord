import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import SubscriptionController from './subscription.controller';
import authAdminGuard from '../auth/guard/auth.admin.guard';
import authGuard from '../auth/guard/auth.guard';

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
    this.subscrRouter.get('/public/user', (...args) => this.subscrController.getAllSubscriptionsByUserId(...args));
    this.subscrRouter.get(
      '/public/subscriber', (...args) => this.subscrController.getAllSubscriptionsBySubscriberId(...args)
    );
    this.subscrRouter.post(
      '/public', (...args) => this.subscrController.createSubscriptionAsSubscriber(...args)
    );
    this.subscrRouter.delete(
      '/public/user/:subscriptionId',
      (...args) => this.subscrController.deleteUserSubscription(...args)
    );
    this.subscrRouter.delete(
      '/public/subscriber/:subscriptionId',
      (...args) => this.subscrController.deleteSubscriberSubscription(...args)
    );

    this.subscrRouter.use('/admin', authAdminGuard);
    this.subscrRouter.get('/admin', (...args) => this.subscrController.getAllSubscriptions(...args));
    this.subscrRouter.get(
      '/admin/:subscriptionId', (...args) => this.subscrController.getSubscriptionById(...args)
    );
    this.subscrRouter.patch(
      '/admin/:subscriptionId', (...args) => this.subscrController.updateSubscriptionById(...args)
    );
    this.subscrRouter.delete(
      '/admin/:subscriptionId', (...args) => this.subscrController.deleteSubscriptionById(...args)
    );
  }
}
export default SubscriptionRouter;
