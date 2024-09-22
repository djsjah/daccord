import Joi, { ObjectSchema } from 'joi';
import IPostUpdate from '../interface/post.update.interface';

const PostUpdateSchema: ObjectSchema<IPostUpdate> = Joi.object({
  title: Joi.string().min(4).max(100).optional(),
  content: Joi.string().optional(),
  isMainRevision: Joi.boolean().optional()
});
export default PostUpdateSchema;
