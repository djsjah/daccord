import dependencyContainer from '../dependencyInjection/dependency.container';
import NotificationGateway from './notification.gateway';

class NotificationModule {
  constructor() {
    dependencyContainer.registerInstance('notifGateway', new NotificationGateway());
  }
}
export default NotificationModule;
