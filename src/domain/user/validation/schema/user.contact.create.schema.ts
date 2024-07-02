import Joi, { ObjectSchema } from 'joi';
import IUserContactCreate from '../interface/user.contact.create.interface';

const UserContactCreateSchema: ObjectSchema<IUserContactCreate> = Joi.object({
  type: Joi.string().required(),
  value: Joi.string().required()
});
export default UserContactCreateSchema;
