import { Request, Response, NextFunction } from 'express';
import {
  SubscriptionGetByIdSchema,
  SubscriptionTypeSchema
} from './validation/schema/subscription.get.schema';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
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
      const subscriptionType = req.params.subscriptionType;
      const { error } = SubscriptionTypeSchema.validate(subscriptionType);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const searchSubstring = req.query.search as string;
      let subscriptions;

      if (subscriptionType === 'user') {
        subscriptions = await this.subscriptionService.getAllSubscriptions(user, searchSubstring, {
          userId: user.id
        });
      }
      else if (subscriptionType === 'subscriber') {
        subscriptions = await this.subscriptionService.getAllSubscriptions(user, searchSubstring, {
          subscriberId: user.id
        });
      }

      subscriptions = await this.subscriptionService.getAllSubscriptions(user, searchSubstring);

      return res.status(200).json({
        status: 200,
        data: subscriptions,
        message: "List of all subscriptions"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getSubscriptionById(
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

      const subscriptionType = req.params.subscriptionType;
      const subscriptionTypeValid = SubscriptionTypeSchema.validate(subscriptionType);

      if (subscriptionTypeValid.error) {
        return res.status(422).send(`Validation error: ${subscriptionTypeValid.error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      let subscription;

      if (subscriptionType === 'user') {
        subscription = await this.subscriptionService.getSubscriptionById(user, subscriptionId, {
          userId: user.id
        });

      }
      else if (subscriptionType === 'subscriber') {
        subscription = await this.subscriptionService.getSubscriptionById(user, subscriptionId, {
          subscriberId: user.id
        });
      }

      subscription = await this.subscriptionService.getSubscriptionById(user, subscriptionId);

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

      const subscriber = req.user as IUserPayload;
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

      const user = req.user as IUserPayload;
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

  public async deleteSubscriptionById(
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

      const subscriptionType = req.params.subscriptionType;
      const subscriptionTypeValid = SubscriptionTypeSchema.validate(subscriptionType);

      if (subscriptionTypeValid.error) {
        return res.status(422).send(`Validation error: ${subscriptionTypeValid.error.details[0].message}`);
      }

      const user = req.user as IUserPayload;

      if (subscriptionType === 'user') {
        await this.subscriptionService.deleteSubscriptionById(user, subscriptionId, {
          userId: user.id
        });
      }
      else if (subscriptionType === 'subscriber') {
        await this.subscriptionService.deleteSubscriptionById(user, subscriptionId, {
          subscriberId: user.id
        });
      }

      await this.subscriptionService.deleteSubscriptionById(user, subscriptionId);
      return res.status(200).json({ status: 200, message: "Subscription successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default SubscriptionController;
