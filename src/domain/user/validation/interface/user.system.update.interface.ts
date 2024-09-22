import UserRole from '../enum/user.role.enum';

interface IUserSystemUpdate {
  name?: string;
  role?: UserRole;
  email?: string;
  password?: string;
  isActivated?: boolean;
  refreshToken?: string | null;
  verifToken?: string | null;
  rating?: number;
};
export default IUserSystemUpdate;
