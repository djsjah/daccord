import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
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

  public async getAllSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await Subscription.findAll({
      where: {
        userId
      },
      attributes: this.publicSubscrData
    });

    if (subscriptions.length === 0) {
      throw new NotFound(`Subscriptions are not found`);
    }

    return subscriptions;
  }

  public async getAllSubscriptionsBySubscriberId(subscriberId: string): Promise<Subscription[]> {
    const subscriptions = await Subscription.findAll({
      where: {
        subscriberId
      },
      attributes: this.publicSubscrData
    });

    if (subscriptions.length === 0) {
      throw new NotFound(`Subscriptions are not found`);
    }

    return subscriptions;
  }

  public async getSubscriptionById(subscriptionId: string, isPublicData = false): Promise<Subscription> {
    let subscription;
    if (isPublicData) {
      subscription = await Subscription.findOne({
        where: { id: subscriptionId },
        attributes: this.publicSubscrData
      });
    }
    else {
      subscription = await Subscription.findOne({
        where: { id: subscriptionId }
      });
    }

    if (!subscription) {
      throw new NotFound(`Subscription with id: ${subscriptionId} - is not found`);
    }

    return subscription;
  }

  public async getUserSubscription(subscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: {
        id: subscriptionId,
        userId
      }
    });

    if (!subscription) {
      throw new NotFound(
        `Subscription with id: ${subscriptionId} and with user id: ${userId} - is not found`
      );
    }

    return subscription;
  }

  public async getSubscriberSubscription(subscriptionId: string, subscriberId: string): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: {
        id: subscriptionId,
        subscriberId
      }
    });

    if (!subscription) {
      throw new NotFound(
        `Subscription with id: ${subscriptionId} and with subscriber id: ${subscriberId} - is not found`
      );
    }

    return subscription;
  }

  public async createSubscriptionAsSubscriber(
    subscriberName: string,
    subscriptionDataCreate: ISubscriptionCreate
  ): Promise<Subscription> {
    const user = await this.userService.getUserByName(subscriptionDataCreate.userName);
    const subscription = await Subscription.create({
      ...subscriptionDataCreate,
      subscriberName,
      userId: user.id
    });

    return (
      await this.getSubscriptionById(subscription.id, true)
    );
  }

  public async updateSubscriptionById(
    subscriptionId: string,
    newSubscriptionData: ISubscriptionUpdate
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    Object.assign(subscription, newSubscriptionData);
    await subscription.save();

    return subscription;
  }

  public async deleteSubscriptionById(subscriptionId: string): Promise<void> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    await subscription.destroy();
  }

  public async deleteUserSubscription(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await this.getUserSubscription(subscriptionId, userId);
    await subscription.destroy();
  }

  public async deleteSubscriberSubscription(subscriptionId: string, subscriberId: string): Promise<void> {
    const subscription = await this.getSubscriberSubscription(subscriptionId, subscriberId);
    await subscription.destroy();
  }
}
export default SubscriptionService;
