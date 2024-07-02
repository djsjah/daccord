import Joi, { ObjectSchema } from 'joi';
import IUserContactUpdate from '../../interface/update/user.contact.update.interface';

const UserContactUpdateSchema: ObjectSchema<IUserContactUpdate> = Joi.object({
  type: Joi.string().optional(),
  value: Joi.string().optional()
});
export default UserContactUpdateSchema;
