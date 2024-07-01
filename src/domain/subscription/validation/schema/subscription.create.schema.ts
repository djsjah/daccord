import Joi, { ObjectSchema } from 'joi';
import ISubscriptionCreate from '../interface/subscription.create.interface';

const SubscriptionCreateSchema: ObjectSchema<ISubscriptionCreate> = Joi.object({
  type: Joi.string().required(),
  period: Joi.string().isoDate().optional(),
  userName: Joi.string().min(2).max(15).required()
});
export default SubscriptionCreateSchema;
