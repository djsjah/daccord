import Joi, { Schema } from 'joi';

const PostSearchParamSchema: Schema<string> = Joi.string().valid('title', 'content').optional();
export default PostSearchParamSchema;
