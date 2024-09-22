import Joi, { ObjectSchema } from 'joi';
import IAdminUpdate from '../interface/admin.update.interface';
import UserRole from '../enum/user.role.enum';

const AdminUpdateSchema: ObjectSchema<IAdminUpdate> = Joi.object({
  name: Joi.string().min(2).max(15).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$%*?&]).{8,}$')
  ).optional(),
  rating: Joi.number().integer().optional()
});
export default AdminUpdateSchema;
