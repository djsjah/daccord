import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import SubscriptionController from './subscription.controller';
import authAdminGuard from '../auth/guard/auth.admin.guard';

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
    this.subscrRouter.use(authAdminGuard);
    this.subscrRouter.get('/', (...args) => this.subscrController.getAllSubscriptions(...args));
    this.subscrRouter.get('/:userId', (...args) => this.subscrController.getAllSubscriptionsByUserId(...args));

    this.subscrRouter.get(
      '/:subscriberId', (...args) => this.subscrController.getAllSubscriptionsBySubscriberId(...args)
    );

    this.subscrRouter.get(
      '/:subscriptionId', (...args) => this.subscrController.getSubscriptionById(...args)
    );

    this.subscrRouter.post('/', (...args) => this.subscrController.createSubscription(...args));

    this.subscrRouter.put(
      '/:subscriptionId', (...args) => this.subscrController.updateSubscriptionById(...args)
    );

    this.subscrRouter.patch(
      '/:subscriptionId', (...args) => this.subscrController.updateSubscriptionById(...args)
    );

    this.subscrRouter.delete(
      '/:subscriptionId', (...args) => this.subscrController.deleteSubscriptionById(...args)
    );
  }
}
export default SubscriptionRouter;
