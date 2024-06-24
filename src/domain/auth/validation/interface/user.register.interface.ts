import IUserContact from '../../../user/validation/interface/user.contact.interface';

interface IUserRegister {
  name: string;
  role: 'admin' | 'user';
  email: string;
  password: string;
  contacts?: IUserContact[];
};
export default IUserRegister;
