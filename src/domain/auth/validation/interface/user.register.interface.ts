import IUserContactCreate from "../../../user/validation/interface/user.contact.create.interface";

interface IUserRegister {
  name: string;
  role: 'admin' | 'user';
  email: string;
  password: string;
  contacts?: IUserContactCreate[];
};
export default IUserRegister;
