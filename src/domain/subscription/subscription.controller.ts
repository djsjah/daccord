import { Request, Response, NextFunction } from 'express';
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
      return res.status(200).json({ status: 200, data: subscriptions, message: "List of all subscriptions" });
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
      const userId = req.params.userId;
      const { error } = SubscriptionGetByIdSchema.validate(userId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const subscriptions = await this.subscriptionService.getAllSubscriptionsByUserId(userId);

      return res.status(200).json({
        status: 200,
        data: subscriptions,
        message: `List of all subscriptions with user id: ${userId}`
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
      const subscriberId = req.params.subscriberId;
      const { error } = SubscriptionGetByIdSchema.validate(subscriberId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const subscriptions = await this.subscriptionService.getAllSubscriptionsBySubscriberId(subscriberId);

      return res.status(200).json({
        status: 200,
        data: subscriptions,
        message: `List of all subscriptions with subscriber id: ${subscriberId}`
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getSubscriptionById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const subscriptionId = req.params.subscriptionId;
      const { error } = SubscriptionGetByIdSchema.validate(subscriptionId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const subscriptions = await this.subscriptionService.getSubscriptionById(subscriptionId);
      return res.status(200).json({ status: 200, data: subscriptions, message: "Subscription details" });
    }
    catch (err) {
      next(err);
    }
  }

  public async createSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const subscriptionDataCreate = req.body;
      const { error } = SubscriptionCreateSchema.validate(subscriptionDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const newSubscription = await this.subscriptionService.createSubscription(subscriptionDataCreate);
      return res.status(201).location(`/api/subscriptions/${newSubscription.id}`).json(
        { status: 201, data: newSubscription, message: "Subscription successfully created" }
      );
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
      const subscriptionIdValid = SubscriptionCreateSchema.validate(subscriptionId);

      if (subscriptionIdValid.error) {
        return res.status(422).send(`Validation error: ${subscriptionIdValid.error.details[0].message}`);
      }

      const newSubscriptionData = req.body;
      const newSubscriptionDataValid = SubscriptionUpdateSchema.validate(newSubscriptionData);

      if (newSubscriptionDataValid.error) {
        return res.status(422).send(`Validation error: ${newSubscriptionDataValid.error.details[0].message}`);
      }

      const updatedSubscription = await this.subscriptionService.updateSubscriptionById(
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
      const { error } = SubscriptionCreateSchema.validate(subscriptionId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      await this.subscriptionService.deleteSubscriptionById(subscriptionId);
      return res.status(200).json({ status: 200, message: "Subscription successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default SubscriptionController;
