import Joi, { ObjectSchema } from 'joi';
import IUserPublicUpdate from '../../../interface/update/public/user.public.update.interface';

const UserPublicUpdateSchema: ObjectSchema<IUserPublicUpdate> = Joi.object({
  name: Joi.string().min(2).max(15).optional(),
  email: Joi.string().email().optional(),
  newPassword: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).optional(),
  oldPassword: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).optional()
});
export default UserPublicUpdateSchema;
