import { FindOptions } from 'sequelize';
import UserRole from './user/validation/enum/user.role.enum';

type RoleSettingsType = {
  [K in UserRole]: Partial<FindOptions>;
}
export default RoleSettingsType;
