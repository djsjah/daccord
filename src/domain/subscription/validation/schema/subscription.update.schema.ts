import Joi, { ObjectSchema } from 'joi';
import ISubscriptionUpdate from '../interface/subscription.update.interface';

const SubscriptionUpdateSchema: ObjectSchema<ISubscriptionUpdate> = Joi.object({
  type: Joi.string().required(),
  period: Joi.string().isoDate().required()
});
export default SubscriptionUpdateSchema;
