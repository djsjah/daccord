import { Model, FindOptions } from 'sequelize';
import RoleSettingsType from './role.settings.interface';
import IUserPayload from './auth/validation/interface/user.payload.interface';
import UserRole from './user/validation/enum/user.role.enum';


abstract class DomainService {
  protected readonly abstract roleSettings: RoleSettingsType;
  protected abstract modelRoleFilter(target: Model, userRole?: UserRole): Partial<Model>;
  protected abstract findOptionsRoleFilter(
    findOptions: FindOptions,
    userData: IUserPayload | UserRole
  ): FindOptions;
}
export default DomainService;
