import Joi, { ObjectSchema } from 'joi';
import IUser from '../interface/user.interface';
import UserContactSchema from './user.contact.schema';

const UserSchema: ObjectSchema<IUser> = Joi.object({
  name: Joi.string().min(2).max(15).required(),
  role: Joi.string().min(4).max(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
  rating: Joi.number().integer().optional(),
  contacts: Joi.array().items(UserContactSchema).optional()
});
export default UserSchema;
