import Joi, { ObjectSchema } from 'joi';
import IUserPrivateUpdate from '../../../interface/update/private/user.private.update.interface';

const UserPrivateUpdateSchema: ObjectSchema<IUserPrivateUpdate> = Joi.object({
  name: Joi.string().min(2).max(15).optional(),
  role: Joi.string().valid('admin', 'user').optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).optional(),
  rating: Joi.number().integer().optional()
});
export default UserPrivateUpdateSchema;
