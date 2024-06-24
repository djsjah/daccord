import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import ISubscriptionCreate from './validation/interface/subscription.create.interface';
import ISubscriptionUpdate from './validation/interface/subscription.update.interface';
import Subscription from '../../database/models/subscription/subscription.model';
import UserService from '../user/service/user.service';

class SubscriptionService {
  private readonly userService: UserService;

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
      }
    });

    if (subscriptions.length === 0) {
      throw new NotFound(`Subscriptions by user id: ${userId} - are not found`);
    }

    return subscriptions;
  }

  public async getAllSubscriptionsBySubscriberId(subscriberId: string): Promise<Subscription[]> {
    const subscriptions = await Subscription.findAll({
      where: {
        subscriberId
      }
    });

    if (subscriptions.length === 0) {
      throw new NotFound(`Subscriptions by subscriber id: ${subscriberId} - are not found`);
    }

    return subscriptions;
  }

  public async getSubscriptionById(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      throw new NotFound(`Subscription with id: ${subscriptionId} - is not found`);
    }

    return subscription;
  }

  public async createSubscription(subscriptionDataCreate: ISubscriptionCreate): Promise<Subscription> {
    await this.userService.getUserById(subscriptionDataCreate.userId);
    await this.userService.getUserById(subscriptionDataCreate.subscriberId);

    return (
      await Subscription.create({
        ...subscriptionDataCreate
      })
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
}
export default SubscriptionService;
