import Joi from 'joi';

export const PostGetByIdSchema = Joi.string().uuid().required();
export const PostGetByTitleSchema = Joi.string().min(4).max(100).required();
