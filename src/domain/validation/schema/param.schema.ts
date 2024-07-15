import Joi, { Schema } from 'joi';

const IdSchema: Schema<string> = Joi.string().uuid().required();
export default IdSchema;
