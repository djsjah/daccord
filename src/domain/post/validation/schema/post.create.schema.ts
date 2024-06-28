import Joi, { ObjectSchema } from 'joi';
import IPostCreate from '../interface/post.create.interface';

const PostCreateSchema: ObjectSchema<IPostCreate> = Joi.object({
  title: Joi.string().min(4).max(100).required(),
  access: Joi.string().valid('public', 'private').required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional()
});
export default PostCreateSchema;
