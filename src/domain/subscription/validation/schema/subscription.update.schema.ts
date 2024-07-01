import Joi, { ObjectSchema } from 'joi';
import ISubscriptionUpdate from '../interface/subscription.update.interface';

const SubscriptionUpdateSchema: ObjectSchema<ISubscriptionUpdate> = Joi.object({
  type: Joi.string().optional(),
  period: Joi.string().isoDate().optional()
});
export default SubscriptionUpdateSchema;
