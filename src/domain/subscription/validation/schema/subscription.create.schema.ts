import Joi, { ObjectSchema } from 'joi';
import ISubscriptionCreate from '../interface/subscription.create.interface';

const SubscriptionCreateSchema: ObjectSchema<ISubscriptionCreate> = Joi.object({
  type: Joi.string().required(),
  period: Joi.string().isoDate().optional(),
  userId: Joi.string().uuid().required(),
  subscriberId: Joi.string().uuid().required()
});
export default SubscriptionCreateSchema;
