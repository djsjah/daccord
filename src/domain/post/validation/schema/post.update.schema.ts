import Joi, { ObjectSchema } from 'joi';
import IPostUpdate from '../interface/post.update.interface';

const PostUpdateSchema: ObjectSchema<IPostUpdate> = Joi.object({
  title: Joi.string().min(4).max(100).required(),
  access: Joi.string().valid('public', 'private').required(),
  content: Joi.string().required(),
  rating: Joi.number().integer().required(),
  tags: Joi.array().items(Joi.string()).required()
});
export default PostUpdateSchema;
