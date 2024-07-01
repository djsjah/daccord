import Joi, { ObjectSchema } from 'joi';
import IUserPutUpdate from '../../interface/update/private/user.put.update.interface';

const UserPutUpdateSchema: ObjectSchema<IUserPutUpdate> = Joi.object({
  name: Joi.string().min(2).max(15).required(),
  role: Joi.string().valid('admin', 'user').required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).required(),
  isActivated: Joi.boolean().required(),
  verifToken: Joi.string().allow(null).required(),
  rating: Joi.number().integer().required()
});
export default UserPutUpdateSchema;
