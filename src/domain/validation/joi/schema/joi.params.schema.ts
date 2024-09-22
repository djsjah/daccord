import Joi, { Schema } from 'joi';

export const IdSchemaRequired: Schema<string> = Joi.string().uuid().required();
export const IdSchemaOptional: Schema<string> = Joi.string().uuid().optional();
