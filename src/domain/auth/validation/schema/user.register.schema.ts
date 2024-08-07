import Joi, { ObjectSchema } from 'joi';
import IUserRegister from '../interface/user.register.interface';
import UserContactCreateSchema from '../../../user/validation/schema/user.contact.create.schema';

const UserRegisterSchema: ObjectSchema<IUserRegister> = Joi.object({
  name: Joi.string().min(2).max(15).required(),
  role: Joi.string().valid('admin', 'user').required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).required(),
  contacts: Joi.array().items(UserContactCreateSchema).optional()
});
export default UserRegisterSchema;
