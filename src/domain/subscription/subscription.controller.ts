import { Request, Response, NextFunction } from 'express';
import User from '../../database/models/user/user.model';
import SubscriptionGetByIdSchema from './validation/schema/subscription.get.schema';
import SubscriptionCreateSchema from './validation/schema/subscription.create.schema';
import SubscriptionUpdateSchema from './validation/schema/subscription.update.schema';
import SubscriptionService from './subscription.service';

class SubscriptionController {
  private readonly subscriptionService: SubscriptionService;

  constructor(subscriptionService: SubscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  public async getAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const subscriptions = await this.subscriptionService.getAllSubscriptions(searchSubstring as string);
      return res.status(200).json({
        status: 200,
        data: subscriptions,
        message: "List of all subscriptions of all users"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getAllSubscriptionsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = req.session.user as User;
      const subscriptions = await this.subscriptionService.getAllSubscriptionsByUserId(user);

      return res.status(200).json({
        status: 200,
        data: subscriptions,
        message: "List of all your subscriptions"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getAllSubscriptionsBySubscriberId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriber = req.session.user as User;
      const subscriptions = await this.subscriptionService.getAllSubscriptionsBySubscriberId(subscriber);

      return res.status(200).json({
        status: 200,
        data: subscriptions,
        message: "List of all your subscriptions"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriptionId = req.params.subscriptionId;
      const { error } = SubscriptionGetByIdSchema.validate(subscriptionId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.session.user as User;
      const subscription = await this.subscriptionService.getUserSubscriptionById(user, subscriptionId);

      return res.status(200).json({
        status: 200,
        data: subscription,
        message: `Subscription details with id ${subscription.id}`
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getSubscriberSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriptionId = req.params.subscriptionId;
      const { error } = SubscriptionGetByIdSchema.validate(subscriptionId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const subscriber = req.session.user as User;
      const subscription = await this.subscriptionService.getSubscriberSubscriptionById(
        subscriber, subscriptionId
      );

      return res.status(200).json({
        status: 200,
        data: subscription,
        message: `Subscription details with id ${subscription.id}`
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async createSubscriptionAsSubscriber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriptionDataCreate = req.body;
      const { error } = SubscriptionCreateSchema.validate(subscriptionDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const subscriber = req.session.user as User;
      subscriptionDataCreate.subscriberName = subscriber.name;
      subscriptionDataCreate.subscriberId = subscriber.id;

      const newSubscription = await this.subscriptionService.createSubscriptionAsSubscriber(
        subscriber,
        subscriptionDataCreate
      );

      return res.status(201).location(`/api/subscriptions/${newSubscription.id}`).json({
         status: 201,
         data: newSubscription,
         message: "Subscription successfully created"
        });
    }
    catch (err) {
      next(err);
    }
  }

  public async updateSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriptionId = req.params.subscriptionId;
      const subscriptionIdValid = SubscriptionGetByIdSchema.validate(subscriptionId);

      if (subscriptionIdValid.error) {
        return res.status(422).send(`Validation error: ${subscriptionIdValid.error.details[0].message}`);
      }

      const newSubscriptionData = req.body;
      const newSubscriptionDataValid = SubscriptionUpdateSchema.validate(newSubscriptionData);

      if (newSubscriptionDataValid.error) {
        return res.status(422).send(`Validation error: ${newSubscriptionDataValid.error.details[0].message}`);
      }

      const user = req.session.user as User;
      const updatedSubscription = await this.subscriptionService.updateSubscriptionById(
        user,
        subscriptionId,
        newSubscriptionData
      );

      return res.status(200).json({
        status: 200,
        data: updatedSubscription,
        message: "Subscription successfully updated"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteUserSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriptionId = req.params.subscriptionId;
      const { error } = SubscriptionGetByIdSchema.validate(subscriptionId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.session.user as User;
      await this.subscriptionService.deleteUserSubscriptionById(user, subscriptionId);

      return res.status(200).json({ status: 200, message: "Subscription successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteSubscriberSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const subscriptionId = req.params.subscriptionId;
      const { error } = SubscriptionGetByIdSchema.validate(subscriptionId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const subscriber = req.session.user as User;
      await this.subscriptionService.deleteSubscriberSubscriptionById(subscriber, subscriptionId);

      return res.status(200).json({ status: 200, message: "Subscription successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default SubscriptionController;
