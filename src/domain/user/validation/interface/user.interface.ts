import IUserContact from './user.contact.interface';

interface IUser {
  name: string;
  role: string;
  email: string;
  password: string;
  rating?: number;
  contacts?: IUserContact[];
};
export default IUser;
