import Joi from 'joi';

export const SubscriptionGetByIdSchema = Joi.string().uuid().required();
export const SubscriptionTypeSchema = Joi.string().valid('user', 'subscriber').required();
