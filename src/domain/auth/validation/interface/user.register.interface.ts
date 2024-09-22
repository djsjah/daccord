import IUserContactCreate from '../../../user/validation/interface/contact/contact.create.interface';
import UserRole from '../../../user/validation/enum/user.role.enum';

interface IUserRegister {
  name: string;
  role: UserRole;
  email: string;
  password: string;
  contacts?: IUserContactCreate[];
};
export default IUserRegister;
