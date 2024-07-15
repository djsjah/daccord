import { FindOptions } from 'sequelize';
import IRoleSettings from './role.settings.interface';
import IUserPayload from './auth/validation/interface/user.payload.interface';

abstract class DomainService {
  protected readonly abstract roleSettings: IRoleSettings;
  protected abstract findOptionsRoleFilter(
    findOptions: FindOptions,
    userData: IUserPayload | 'user' | 'admin'
  ): FindOptions;
}
export default DomainService;
