import Joi, { ObjectSchema } from 'joi';
import IUserCreate from '../interface/user.create.interface';
import UserContactSchema from './user.contact.schema';

const UserCreateSchema: ObjectSchema<IUserCreate> = Joi.object({
  name: Joi.string().min(2).max(15).required(),
  role: Joi.string().valid('admin', 'user').required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).required(),
  contacts: Joi.array().items(UserContactSchema).optional()
});
export default UserCreateSchema;
