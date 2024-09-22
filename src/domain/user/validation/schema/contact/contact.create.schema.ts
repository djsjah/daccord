import Joi, { ObjectSchema } from 'joi';
import IUserContactCreate from '../../interface/contact/contact.create.interface';

const UserContactCreateSchema: ObjectSchema<IUserContactCreate> = Joi.object({
  type: Joi.string().required(),
  value: Joi.string().required()
});
export default UserContactCreateSchema;
