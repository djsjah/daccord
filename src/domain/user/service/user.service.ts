import { FindOptions } from 'sequelize';
import { NotFound } from 'http-errors';
import User from '../../../database/sequelize/models/user/user.model';
import UserContact from '../../../database/sequelize/models/user/user.contact.model';
import RoleSettingsType from '../../role.settings.interface';
import IUserRegister from '../../auth/validation/interface/user.register.interface';
import IUserSystemUpdate from '../validation/interface/user.system.update.interface';
import DomainService from '../../domain.service.abstract';
import UserRole from '../validation/enum/user.role.enum';
import UserPublicFields from '../validation/enum/user.public.fields.enum';

class UserService extends DomainService {
  private readonly userPublicFields: UserPublicFields[] = Object.values(UserPublicFields);

  protected override readonly roleSettings: RoleSettingsType = {
    admin: {},
    user: {
      attributes: this.userPublicFields
    }
  };

  protected override modelRoleFilter(user: User): Partial<User> {
    return user.role === 'user' ?
      Object.fromEntries(
        Object.entries(user)
          .filter(([key]) => this.userPublicFields.includes(key as UserPublicFields))
      ) : user;
  }

  protected override findOptionsRoleFilter(findOptions: FindOptions, userRole: UserRole): FindOptions {
    const roleSpecificOptions = this.roleSettings[userRole];
    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  public async getAllUsers(findOptions: FindOptions, userRole?: UserRole): Promise<User[]> {
    findOptions = userRole ?
      this.findOptionsRoleFilter(findOptions, userRole) : findOptions;

    const users = await User.findAll(findOptions);
    return users;
  }

  public async getUserByUniqueParams(findOptions: FindOptions, userRole?: UserRole): Promise<User> {
    findOptions = userRole ?
      this.findOptionsRoleFilter(findOptions, userRole) : findOptions;

    const user = await User.findOne(findOptions);

    if (!user) {
      throw new NotFound("User is not found");
    }

    return user;
  }

  public async createUser(userDataCreate: IUserRegister): Promise<User> {
    const newUser = await User.create({
      ...userDataCreate
    });

    if (userDataCreate.contacts) {
      const userContactsData = userDataCreate.contacts.map((userContact) => ({
        type: userContact.type,
        value: userContact.value,
        userId: newUser.id
      }));

      await UserContact.bulkCreate(userContactsData);
    }

    return newUser;
  }

  public async updateUser(user: User, newUserData: IUserSystemUpdate): Promise<Partial<User>> {
    Object.assign(user, newUserData);
    await user.save();
    return this.modelRoleFilter(user);
  }

  public async deleteUser(user: User): Promise<void> {
    await user.destroy();
  }
}
export default UserService;
