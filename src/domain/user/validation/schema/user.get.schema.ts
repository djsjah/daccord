import Joi from 'joi';

export const UserGetByStringSchema = Joi.string().required();
export const UserGetByIdSchema = Joi.string().uuid().required();
export const UserGetByEmailSchema = Joi.string().email().required();
export const UserGetByPasswordSchema = Joi.string().pattern(
  new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
).required();
