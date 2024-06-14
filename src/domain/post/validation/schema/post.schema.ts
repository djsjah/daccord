import Joi, { ObjectSchema } from 'joi';
import IPost from '../interface/post.interface';

const PostSchema: ObjectSchema<IPost> = Joi.object({
  title: Joi.string().min(4).max(50).required(),
  access: Joi.string().min(6).max(7).required(),
  content: Joi.string().required(),
  rating: Joi.number().integer().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  authorId: Joi.string().uuid().required()
});
export default PostSchema;
