import { FindOptions } from 'sequelize';
import { NotFound } from 'http-errors';
import User from '../../../database/models/user/user.model';
import UserContact from '../../../database/models/user/user.contact.model';
import Post from '../../../database/models/post/post.model';
import IRoleSettings from '../../role.settings.interface';
import IUserRegister from '../../auth/validation/interface/user.register.interface';
import IUserUpdate from '../validation/interface/update/user.update.interface';
import DomainService from '../../domain.service.abstract';

class UserService extends DomainService {
  protected override readonly roleSettings: IRoleSettings = {
    admin: {
      include: [
        { model: Post, as: 'posts' },
        { model: UserContact, as: 'contacts' }
      ]
    },
    user: {
      attributes: [
        'name',
        'email'
      ]
    }
  };

  protected override findOptionsRoleFilter(findOptions: FindOptions, userRole: 'admin' | 'user'): FindOptions {
    const roleSpecificOptions = this.roleSettings[userRole];
    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  public async getAllUsers(findOptions: FindOptions, userRole?: 'admin' | 'user'): Promise<User[]> {
    findOptions = userRole ?
      this.findOptionsRoleFilter(findOptions, userRole) : findOptions;

    const users = await User.findAll(findOptions);
    return users;
  }

  public async getUserByUniqueParams(findOptions: FindOptions, userRole?: 'admin' | 'user'): Promise<User> {
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

  public async updateUser(user: User, newUserData: IUserUpdate, considerRole: boolean = false): Promise<User> {
    Object.assign(user, newUserData);
    await user.save();

    if (considerRole) {
      return (
        await this.getUserByUniqueParams({
          where: {
            id: user.id
          }
        }, user.role as 'admin' | 'user')
      );
    }

    return user;
  }

  public async deleteUser(user: User): Promise<void> {
    await user.destroy();
  }
}
export default UserService;
