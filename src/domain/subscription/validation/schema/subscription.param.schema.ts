import Joi, { Schema } from 'joi';

const SubscriptionRoleSchema: Schema<string> = Joi.string().valid('user', 'subscriber').required();
export default SubscriptionRoleSchema;
