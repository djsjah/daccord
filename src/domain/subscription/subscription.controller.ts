import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import { IdSchemaRequired } from '../validation/joi/schema/joi.params.schema';
import SubscriptionService from './subscription.service';
import JoiRequestValidation from '../validation/joi/decorator/joi.validation.decorator';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import SubscriptionRole from './validation/enum/subscription.role.enum';
import SubscriptionRoleSchema from './validation/schema/subscription.param.schema';
import SubscriptionCreateSchema from './validation/schema/subscription.create.schema';
import SubscriptionUpdateSchema from './validation/schema/subscription.update.schema';

class SubscriptionController {
  private readonly subscriptionService: SubscriptionService;

  constructor(subscriptionService: SubscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'subscriptionRole'
  }, SubscriptionRoleSchema)
  public async getAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const subscriptionRole = req.params.subscriptionRole as SubscriptionRole;
      const searchSubstring = req.query.search;

      let subscriptions = [];

      if (!searchSubstring) {
        subscriptions = await this.subscriptionService.getAllSubscriptions({}, user, subscriptionRole);
      }
      else {
        subscriptions = await this.subscriptionService.getAllSubscriptions({
          where: {
            [Op.or]: [
              { type: { [Op.like]: `%${searchSubstring}%` } },
              { period: { [Op.like]: `%${searchSubstring}%` } },
              { userName: { [Op.like]: `%${searchSubstring}%` } },
              { subscriberName: { [Op.like]: `%${searchSubstring}%` } }
            ]
          }
        }, user, subscriptionRole);
      }

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

  @JoiRequestValidation({
    type: 'params',
    name: 'subscriptionRole'
  }, SubscriptionRoleSchema)
  @JoiRequestValidation({
    type: 'params',
    name: 'subscriptionId'
  }, IdSchemaRequired)
  public async getSubscriptionById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const subscriptionRole = req.params.subscriptionRole as SubscriptionRole;
      const subscription = await this.subscriptionService.getSubscriptionByUniqueParams({
        where: {
          id: req.params.subscriptionId
        }
      }, user, subscriptionRole);

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

  @JoiRequestValidation({
    type: 'body'
  }, SubscriptionCreateSchema)
  public async createSubscriptionAsSubscriber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  {
    try {
      const subscriptionDataCreate = req.body;
      const subscriber = req.user as IUserPayload;

      subscriptionDataCreate.subscriberName = subscriber.name;
      subscriptionDataCreate.subscriberId = subscriber.id;

      const newSubscription = await this.subscriptionService.createSubscriptionAsSubscriber(
        subscriber.role,
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

  @JoiRequestValidation({
    type: 'params',
    name: 'subscriptionId'
  }, IdSchemaRequired)
  @JoiRequestValidation({
    type: 'body'
  }, SubscriptionUpdateSchema)
  public async updateSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  {
    try {
      const subscription = await this.subscriptionService.getSubscriptionByUniqueParams({
        where: {
          id: req.params.subscriptionId
        }
      });

      const updatedSubscription = await this.subscriptionService.updateSubscription(
        subscription,
        req.body
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

  @JoiRequestValidation({
    type: 'params',
    name: 'subscriptionId'
  }, IdSchemaRequired)
  @JoiRequestValidation({
    type: 'params',
    name: 'subscriptionRole'
  }, SubscriptionRoleSchema)
  public async deleteSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const subscriptionRole = req.params.subscriptionRole as SubscriptionRole;
      const subscription = await this.subscriptionService.getSubscriptionByUniqueParams({
        where: {
          id: req.params.subscriptionId
        }
      }, user, subscriptionRole);

      await this.subscriptionService.deleteSubscription(subscription);
      return res.status(200).json({ status: 200, message: "Subscription successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default SubscriptionController;
