import Joi, { ObjectSchema } from 'joi';
import IUserUpdateAuth from '../interface/user.auth.update.interface';

const UserUpdateAuthSchema: ObjectSchema<IUserUpdateAuth> = Joi.object({
  email: Joi.string().email().optional(),
  isActivated: Joi.boolean().optional(),
  refreshToken: Joi.string().allow(null).optional(),
  verifToken: Joi.string().allow(null).optional()
});
export default UserUpdateAuthSchema;
