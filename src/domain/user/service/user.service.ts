import { Op } from 'sequelize';
import { NotFound, Forbidden } from 'http-errors';
import IUserRegister from '../../auth/validation/interface/user.register.interface';
import IUserUpdateAuth from '../../auth/validation/interface/user.auth.update.interface';
import IUserPrivateUpdate from '../validation/interface/update/private/user.private.update.interface';
import IUserPublicUpdate from '../validation/interface/update/public/user.public.update.interface';
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

  public async getAllNonActivatedUsers(): Promise<User[]> {
    return (
      await User.findAll({
        where: {
          isActivated: false
        }
      })
    );
  }

  public async getAllUsersWithVerifToken(): Promise<User[]> {
    return (
      await User.findAll({
        where: {
          verifToken: {
            [Op.ne]: null
          }
        }
      })
    );
  }

  public async getUserById(userId: string, includeAssociations = true, isPublicData = false): Promise<User> {
    let user;

    if (includeAssociations && !isPublicData) {
      user = await User.findOne({
        where: { id: userId },
        include: this.userAssociations
      });
    }
    else if (!includeAssociations && !isPublicData) {
      user = await User.findOne({
        where: { id: userId }
      });
    }
    else if (!includeAssociations && isPublicData) {
      user = await User.findOne({
        where: { id: userId },
        attributes: this.publicUserData
      });
    }

    if (!user) {
      throw new NotFound(`User with id: ${userId} - is not found`);
    }

    return user;
  }

  public async getUserByName(userName: string): Promise<User> {
    const user = await User.findOne({
      where: { name: userName }
    });

    if (user && !user.isActivated) {
      throw new Forbidden(`Forbidden - user with name: ${userName} is not activated`);
    }

    if (!user) {
      throw new NotFound(`User with name: ${userName} - is not found`);
    }

    return user;
  }

  public async getUserByEmail(userEmail: string): Promise<User> {
    const user = await User.findOne({
      where: { email: userEmail }
    });

    if (user && !user.isActivated) {
      throw new Forbidden("Forbidden - this account is not activated");
    }

    if (!user) {
      throw new NotFound(`User with email: ${userEmail} - is not found`);
    }

    return user;
  }

  public async getUserByVerifToken(verifToken: string): Promise<User> {
    const user = await User.findOne({
      where: { verifToken }
    });

    if (!user) {
      throw new NotFound(`User with verification token: ${verifToken} - is not found`);
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

    const createdUser = await this.getUserById(newUser.id, false, true);
    return createdUser;
  }

  public async updateUserAuthData(user: User, newUserData: IUserUpdateAuth): Promise<User> {
    Object.assign(user, newUserData);
    await user.save();
    return user;
  }

  public async updateUserById(
    userId: string,
    newUserData: IUserPrivateUpdate,
    includeAssociations = true
  ): Promise<User> {
    const user = await this.getUserById(userId, includeAssociations);
    Object.assign(user, newUserData);
    await user.save();

    return user;
  }

  public async updateUser(user: User, newUserData: IUserPublicUpdate): Promise<User> {
    await User.update(newUserData, {
      where: {
        id: user.id
      }
    });

    return (
      await this.getUserById(user.id, false, true)
    );
  }

  public async deleteUserById(userId: string): Promise<void> {
    const user = await this.getUserById(userId, false);
    await user.destroy();
  }

  public async deleteUser(user: User): Promise<void> {
    await user.destroy();
  }
}
export default UserService;
