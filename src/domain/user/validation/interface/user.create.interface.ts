import IUserContact from './user.contact.interface';

interface IUserCreate {
  name: string;
  role: 'admin' | 'user';
  email: string;
  password: string;
  contacts?: IUserContact[];
};
export default IUserCreate;
