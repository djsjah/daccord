import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import ISubscriptionCreate from './validation/interface/subscription.create.interface';
import ISubscriptionUpdate from './validation/interface/subscription.update.interface';
import Subscription from '../../database/models/subscription/subscription.model';
import UserService from '../user/service/user.service';

class SubscriptionService {
  private readonly userService: UserService;
  private readonly publicSubscrData = [
    'id',
    'type',
    'period',
    'userName',
    'subscriberName'
  ];

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async getAllSubscriptions(searchSubstring: string): Promise<Subscription[]> {
    let subscriptions = [];

    if (!searchSubstring) {
      subscriptions = await Subscription.findAll();
    }
    else {
      subscriptions = await Subscription.findAll({
        where: {
          [Op.or]: [
            { type: { [Op.like]: `%${searchSubstring}%` } },
            { period: { [Op.like]: `%${searchSubstring}%` } },
            { userId: { [Op.like]: `%${searchSubstring}%` } },
            { subscriberId: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (subscriptions.length === 0) {
        throw new NotFound(`Subscriptions by search substring: ${searchSubstring} - are not found`);
      }
    }

    return subscriptions;
  }

  public async getAllSubscriptionsByUserId(user: IUserPayload): Promise<Subscription[]> {
    let subscriptions: Subscription[] = [];

    if (user.role === 'admin') {
      subscriptions = await Subscription.findAll({
        where: {
          userId: user.id
        }
      });
    }
    else {
      subscriptions = await Subscription.findAll({
        where: {
          userId: user.id
        },
        attributes: this.publicSubscrData
      });
    }

    if (subscriptions.length === 0) {
      throw new NotFound(`Subscriptions are not found`);
    }

    return subscriptions;
  }

  public async getAllSubscriptionsBySubscriberId(subscriber: IUserPayload): Promise<Subscription[]> {
    let subscriptions;

    if (subscriber.role === 'admin') {
      subscriptions = await Subscription.findAll({
        where: {
          subscriberId: subscriber.id
        }
      });
    }
    else {
      subscriptions = await Subscription.findAll({
        where: {
          subscriberId: subscriber.id
        },
        attributes: this.publicSubscrData
      });
    }

    if (subscriptions.length === 0) {
      throw new NotFound(`Subscriptions are not found`);
    }

    return subscriptions;
  }

  public async getUserSubscriptionById(
    user: IUserPayload,
    subscriptionId: string,
    isMainData: boolean = false
  ): Promise<Subscription> {
    let subscription;

    if (user.role === 'admin') {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId
        }
      });
    }
    else if (user.role === 'user' && !isMainData) {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          userId: user.id
        },
        attributes: this.publicSubscrData
      });
    }
    else if (user.role === 'user' && isMainData) {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          userId: user.id
        }
      });
    }

    if (!subscription) {
      throw new NotFound(`Subscription with id: ${subscriptionId} - is not found`);
    }

    return subscription;
  }

  public async getSubscriberSubscriptionById(
    subscriber: IUserPayload,
    subscriptionId: string,
    isMainData: boolean = false
  ): Promise<Subscription> {
    let subscription;

    if (subscriber.role === 'admin') {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId
        }
      });
    }
    else if (subscriber.role === 'user' && !isMainData) {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          subscriberId: subscriber.id
        },
        attributes: this.publicSubscrData
      });
    }
    else if (subscriber.role === 'user' && isMainData) {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          subscriberId: subscriber.id
        }
      });
    }

    if (!subscription) {
      throw new NotFound(`Subscription with id: ${subscriptionId} - is not found`);
    }

    return subscription;
  }

  public async createSubscriptionAsSubscriber(
    subscriber: IUserPayload,
    subscriptionDataCreate: ISubscriptionCreate
  ): Promise<Subscription> {
    const user = await this.userService.getUserByName(subscriptionDataCreate.userName);
    const subscription = await Subscription.create({
      ...subscriptionDataCreate,
      userId: user.id
    });

    return (
      await this.getSubscriberSubscriptionById(subscriber, subscription.id)
    );
  }

  public async updateSubscriptionById(
    user: IUserPayload,
    subscriptionId: string,
    newSubscriptionData: ISubscriptionUpdate
  ): Promise<Subscription> {
    const subscription = await this.getUserSubscriptionById(user, subscriptionId);
    Object.assign(subscription, newSubscriptionData);
    await subscription.save();

    return subscription;
  }

  public async deleteUserSubscriptionById(user: IUserPayload, subscriptionId: string): Promise<void> {
    const subscription = await this.getUserSubscriptionById(user, subscriptionId, true);
    await subscription.destroy();
  }

  public async deleteSubscriberSubscriptionById(
    subscriber: IUserPayload,
    subscriptionId: string
  ): Promise<void> {
    const subscription = await this.getSubscriberSubscriptionById(subscriber, subscriptionId, true);
    await subscription.destroy();
  }
}
export default SubscriptionService;
