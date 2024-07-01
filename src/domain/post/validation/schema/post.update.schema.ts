import Joi, { ObjectSchema } from 'joi';
import IPostUpdate from '../interface/post.update.interface';

const PostUpdateSchema: ObjectSchema<IPostUpdate> = Joi.object({
  title: Joi.string().min(4).max(100).optional(),
  access: Joi.string().valid('public', 'private').optional(),
  content: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});
export default PostUpdateSchema;
