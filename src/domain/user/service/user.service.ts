import { Op } from 'sequelize';
import { NotFound, Forbidden } from 'http-errors';
import IUserRegister from '../../auth/validation/interface/user.register.interface';
import IUserUpdate from '../validation/interface/update/user.update.interface';
import IGetUserParams from '../validation/interface/user.get.params.interface';
import User from '../../../database/models/user/user.model';
import UserContact from '../../../database/models/user/user.contact.model';
import Post from '../../../database/models/post/post.model';

class UserService {
  private readonly userAssociations = [
    { model: Post, as: 'posts' },
    { model: UserContact, as: 'contacts' }
  ];

  private readonly publicUserData = [
    'name',
    'email'
  ];

  private readonly publicParamData = [
    'verifToken',
    'refreshToken'
  ];

  public async getAllUsers(searchSubstring: string): Promise<User[]> {
    let users = [];
    if (!searchSubstring) {
      users = await User.findAll({
        include: this.userAssociations
      });
    }
    else {
      users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchSubstring}%` } },
            { email: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        include: this.userAssociations
      });

      if (users.length === 0) {
        throw new NotFound(`Users by search substring: ${searchSubstring} - are not found`);
      }
    }

    return users;
  }

  public async getAllNonVerifUsers(): Promise<{ nonActivatedUsers: User[], usersWithVerifToken: User[] }> {
    const nonActivatedUsers = await User.findAll({
      where: {
        isActivated: false
      }
    });

    const usersWithVerifToken = await User.findAll({
      where: {
        verifToken: {
          [Op.ne]: null
        }
      }
    });

    return {
      nonActivatedUsers,
      usersWithVerifToken
    };
  }

  public async getUserById(userId: string, includeAssociations = true, isPublicData = false): Promise<User> {
    let user;

    if (includeAssociations && !isPublicData) {
      user = await User.findOne({
        where: {
          id: userId
        },
        include: this.userAssociations
      });
    }
    else if (!includeAssociations && !isPublicData) {
      user = await User.findOne({
        where: {
          id: userId
        }
      });
    }
    else if (!includeAssociations && isPublicData) {
      user = await User.findOne({
        where: {
          id: userId
        },
        attributes: this.publicUserData
      });
    }

    if (!user) {
      throw new NotFound(`User with id: ${userId} - is not found`);
    }

    return user;
  }

  public async getUserByUniqueParams(userParams: IGetUserParams): Promise<User> {
    const user = await User.findOne({
      where: {
        ...userParams
      }
    });

    if (user && !user.isActivated) {
      const hasPublicParam = Object.keys(userParams).some(
        param => this.publicParamData.includes(param)
      );

      if (!hasPublicParam) {
        throw new Forbidden(`Forbidden - user with params: ${userParams} is not activated`);
      }
    }

    if (!user) {
      throw new NotFound(`User with params: ${userParams} - is not found`);
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

    return (
      await this.getUserById(newUser.id)
    );
  }

  public async updateUser(user: User, newUserData: IUserUpdate, userRoleCheck: boolean = true): Promise<User> {
    Object.assign(user, newUserData);
    await user.save();

    if (userRoleCheck) {
      return (
        user.role === 'user' ?
          await this.getUserById(user.id, false, true) :
          await this.getUserById(user.id)
      );
    }

    return user;
  }

  public async deleteUser(user: User): Promise<void> {
    await user.destroy();
  }
}
export default UserService;
