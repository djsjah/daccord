import { FindOptions } from 'sequelize';
import { NotFound } from 'http-errors';
import Subscription from '../../database/sequelize/models/subscription/subscription.model';
import DomainService from '../domain.service.abstract';
import UserService from '../user/service/user.service';
import IRoleSettings from '../role.settings.interface';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import ISubscriptionCreate from './validation/interface/subscription.create.interface';
import ISubscriptionUpdate from './validation/interface/subscription.update.interface';

class SubscriptionService extends DomainService {
  private readonly userService: UserService;
  protected override readonly roleSettings: IRoleSettings = {
    admin: {},
    user: {
      attributes: [
        'id',
        'type',
        'period',
        'userName',
        'subscriberName'
      ]
    }
  };

  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  protected override findOptionsRoleFilter(findOptions: FindOptions, user: IUserPayload): FindOptions {
    const roleSpecificOptions = this.roleSettings[user.role];
    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  private findOptionsSubscriptionFilter(
    findOptions: FindOptions,
    userSubscriptionRole: 'user' | 'subscriber',
    id: string
  ): FindOptions
  {
    switch (userSubscriptionRole) {
      case 'subscriber':
        findOptions.where = {
          ...findOptions.where,
          subscriberId: id
        };
        break;

      case 'user':
        findOptions.where = {
          ...findOptions.where,
          userId: id
        };
        break;
    }

    return findOptions;
  }

  private applyAllFilters(
    findOptions: FindOptions,
    user: IUserPayload,
    subscriptionRole: 'user' | 'subscriber'
  )
  {
    findOptions = this.findOptionsSubscriptionFilter(findOptions, subscriptionRole, user.id);
    findOptions = this.findOptionsRoleFilter(findOptions, user);
    return findOptions;
  }

  public async getAllSubscriptions(
    findOptions: FindOptions,
    user?: IUserPayload,
    subscriptionRole?: 'user' | 'subscriber'
  ): Promise<Subscription[]>
  {
    if (user && subscriptionRole) {
      findOptions = this.applyAllFilters(findOptions, user, subscriptionRole);
    }

    const subscriptions = await Subscription.findAll(findOptions);
    return subscriptions;
  }

  public async getSubscriptionByUniqueParams(
    findOptions: FindOptions,
    user?: IUserPayload,
    subscriptionRole?: 'user' | 'subscriber'
  ): Promise<Subscription>
  {
    if (user && subscriptionRole) {
      findOptions = this.applyAllFilters(findOptions, user, subscriptionRole);
    }

    const subscription = await Subscription.findOne(findOptions);

    if (!subscription) {
      throw new NotFound("Subscription is not found");
    }

    return subscription;
  }

  public async createSubscriptionAsSubscriber(
    subscriber: IUserPayload,
    subscriptionDataCreate: ISubscriptionCreate
  ): Promise<Subscription>
  {
    const user = await this.userService.getUserByUniqueParams({
      where: {
        name: subscriptionDataCreate.userName
      }
    });

    const subscription = await Subscription.create({
      ...subscriptionDataCreate,
      userId: user.id
    });

    return (
      await this.getSubscriptionByUniqueParams({
        where: {
          id: subscription.id
        }
      }, subscriber)
    );
  }

  public async updateSubscription(
    subscription: Subscription,
    newSubscriptionData: ISubscriptionUpdate
  ): Promise<Subscription>
  {
    Object.assign(subscription, newSubscriptionData);
    await subscription.save();

    return (
      await this.getSubscriptionByUniqueParams({
        where: {
          id: subscription.id
        }
      })
    );
  }

  public async deleteSubscription(subscription: Subscription): Promise<void> {
    await subscription.destroy();
  }
}
export default SubscriptionService;
