import Joi, { ObjectSchema } from 'joi';
import IUserContact from '../interface/user.contact.interface';

const UserContactSchema: ObjectSchema<IUserContact> = Joi.object({
  type: Joi.string().required(),
  value: Joi.string().required()
});
export default UserContactSchema;
