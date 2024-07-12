import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import ISubscriptionGet from './validation/interface/subscription.get.interface';
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

  public async getAllSubscriptions(
    user: IUserPayload,
    searchSubstring: string,
    subscrType: ISubscriptionGet = {}
  ): Promise<Subscription[]> {
    let subscriptions: Subscription[] = [];

    if (user.role === 'admin' && !searchSubstring) {
      subscriptions = await Subscription.findAll();
    }
    else if (user.role === 'user' && !searchSubstring) {
      subscriptions = await Subscription.findAll({
        where: {
          ...subscrType
        },
        attributes: this.publicSubscrData
      });
    }
    else if (user.role === 'admin' && searchSubstring) {
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
    else if (user.role === 'user' && searchSubstring) {
      subscriptions = await Subscription.findAll({
        where: {
          ...subscrType,
          [Op.or]: [
            { type: { [Op.like]: `%${searchSubstring}%` } },
            { period: { [Op.like]: `%${searchSubstring}%` } },
            { userId: { [Op.like]: `%${searchSubstring}%` } },
            { subscriberId: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        attributes: this.publicSubscrData
      });

      if (subscriptions.length === 0) {
        throw new NotFound(`Subscriptions by search substring: ${searchSubstring} - are not found`);
      }
    }

    return subscriptions;
  }

  public async getSubscriptionById(
    user: IUserPayload,
    subscriptionId: string,
    subscrType: ISubscriptionGet = {},
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
          ...subscrType
        },
        attributes: this.publicSubscrData
      });
    }
    else if (user.role === 'user' && isMainData) {
      subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          ...subscrType
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
    const user = await this.userService.getUserByUniqueParams({
      name: subscriptionDataCreate.userName
    });

    const subscription = await Subscription.create({
      ...subscriptionDataCreate,
      userId: user.id
    });

    return (
      await this.getSubscriptionById(subscriber, subscription.id, {
        subscriberId: subscriber.id
      })
    );
  }

  public async updateSubscriptionById(
    user: IUserPayload,
    subscriptionId: string,
    newSubscriptionData: ISubscriptionUpdate
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(user, subscriptionId);
    Object.assign(subscription, newSubscriptionData);
    await subscription.save();

    return subscription;
  }

  public async deleteSubscriptionById(
    user: IUserPayload,
    subscriptionId: string,
    subscrType: ISubscriptionGet = {}
  ): Promise<void> {
    const subscription = await this.getSubscriptionById(user, subscriptionId, subscrType, true);
    await subscription.destroy();
  }
}
export default SubscriptionService;
