import Joi from 'joi';

const SubscriptionGetByIdSchema = Joi.string().uuid().required();
export default SubscriptionGetByIdSchema;
