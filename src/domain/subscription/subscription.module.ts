import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import SubscriptionRouter from './subscription.routes';
import SubscriptionController from './subscription.controller';
import SubscriptionService from './subscription.service';
import UserService from '../user/service/user.service';

class SubscriptionModule {
  private readonly subscrService: SubscriptionService;
  private readonly subscrController: SubscriptionController;

  constructor() {
    this.subscrService = new SubscriptionService(
      dependencyContainer.getInstance<UserService>('userService')
    );

    this.subscrController = new SubscriptionController(this.subscrService);

    dependencyContainer.registerInstance('subscrService', this.subscrService);
    dependencyContainer.registerInstance('subscrController', this.subscrController);
    dependencyContainer.registerInstance('subscrRouter', new SubscriptionRouter())
  }
}
export default SubscriptionModule;
