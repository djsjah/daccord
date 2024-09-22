import UserRole from '../enum/user.role.enum';

interface IAdminUpdate {
  name?: string;
  role?: UserRole;
  email?: string;
  password?: string;
  rating?: number;
};
export default IAdminUpdate;
