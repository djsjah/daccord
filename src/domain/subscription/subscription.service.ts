import { FindOptions } from 'sequelize';
import { NotFound } from 'http-errors';
import Subscription from '../../database/sequelize/models/subscription/subscription.model';
import DomainService from '../domain.service.abstract';
import UserService from '../user/service/user.service';
import RoleSettingsType from '../role.settings.interface';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import ISubscriptionCreate from './validation/interface/subscription.create.interface';
import ISubscriptionUpdate from './validation/interface/subscription.update.interface';
import SubscriptionRole from './validation/enum/subscription.role.enum';
import SubscriptionRoleFilter from './validation/enum/subscription.role.filter.enum';
import SubscriptionPublicFields from './validation/enum/subscription.public.fields.enum';
import UserRole from '../user/validation/enum/user.role.enum';

class SubscriptionService extends DomainService {
  private readonly userService: UserService;
  private readonly subscrPublicFields: SubscriptionPublicFields[] = Object.values(SubscriptionPublicFields);

  protected override readonly roleSettings: RoleSettingsType = {
    admin: {},
    user: {
      attributes: this.subscrPublicFields
    }
  };

  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  private applySubscriptionFilters(
    findOptions: FindOptions,
    user: IUserPayload,
    subscriptionRole: SubscriptionRole
  ): FindOptions {
    findOptions = this.findOptionsRoleFilter(findOptions, user.role);
    findOptions.where = {
      ...findOptions.where,
      [SubscriptionRoleFilter[subscriptionRole]]: user.id
    }

    return findOptions;
  }

  protected override modelRoleFilter(userRole: UserRole, subscription: Subscription): Partial<Subscription> {
    return userRole === 'user' ?
      Object.fromEntries(
        Object.entries(subscription)
          .filter(([key]) => this.subscrPublicFields.includes(key as SubscriptionPublicFields))
      ) : subscription;
  }

  protected override findOptionsRoleFilter(findOptions: FindOptions, userRole: UserRole): FindOptions {
    const roleSpecificOptions = this.roleSettings[userRole];
    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  public async getAllSubscriptions(
    findOptions: FindOptions,
    user?: IUserPayload,
    subscriptionRole?: SubscriptionRole
  ): Promise<Subscription[]> {
    if (user && subscriptionRole) {
      findOptions = this.applySubscriptionFilters(findOptions, user, subscriptionRole);
    }

    const subscriptions = await Subscription.findAll(findOptions);
    return subscriptions;
  }

  public async getSubscriptionByUniqueParams(
    findOptions: FindOptions,
    user?: IUserPayload,
    subscriptionRole?: SubscriptionRole
  ): Promise<Subscription> {
    if (user && subscriptionRole) {
      findOptions = this.applySubscriptionFilters(findOptions, user, subscriptionRole);
    }

    const subscription = await Subscription.findOne(findOptions);
    if (!subscription) {
      throw new NotFound("Subscription is not found");
    }

    return subscription;
  }

  public async createSubscriptionAsSubscriber(
    subscriberRole: UserRole,
    subscriptionDataCreate: ISubscriptionCreate
  ): Promise<Partial<Subscription>> {
    const user = await this.userService.getUserByUniqueParams({
      where: {
        name: subscriptionDataCreate.userName
      }
    });

    const newSubscription = await Subscription.create({
      ...subscriptionDataCreate,
      userId: user.id
    });

    return this.modelRoleFilter(subscriberRole, newSubscription);
  }

  public async updateSubscription(
    subscription: Subscription,
    newSubscriptionData: ISubscriptionUpdate
  ): Promise<Subscription> {
    Object.assign(subscription, newSubscriptionData);
    await subscription.save();
    return subscription;
  }

  public async deleteSubscription(subscription: Subscription): Promise<void> {
    await subscription.destroy();
  }
}
export default SubscriptionService;
