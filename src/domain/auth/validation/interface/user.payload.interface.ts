import UserRole from '../../../user/validation/enum/user.role.enum';

interface IUserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
export default IUserPayload;
