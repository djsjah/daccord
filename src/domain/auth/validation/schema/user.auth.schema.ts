import Joi, { ObjectSchema } from 'joi';
import IUserAuth from '../interface/user.auth.interface';

const UserAuthSchema: ObjectSchema<IUserAuth> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).required()
});
export default UserAuthSchema;
