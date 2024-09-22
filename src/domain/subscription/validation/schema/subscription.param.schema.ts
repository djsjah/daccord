import Joi, { Schema } from 'joi';
import SubscriptionRole from '../enum/subscription.role.enum';

const SubscriptionRoleSchema: Schema<string> = Joi.string().valid(...Object.values(SubscriptionRole)).required();
export default SubscriptionRoleSchema;
