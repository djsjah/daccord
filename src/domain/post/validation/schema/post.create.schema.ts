import Joi, { ObjectSchema } from 'joi';
import IPostCreate from '../interface/post.create.interface';

const PostCreateSchema: ObjectSchema<IPostCreate> = Joi.object({
  title: Joi.string().min(4).max(100).required(),
  content: Joi.string().required()
});
export default PostCreateSchema;
