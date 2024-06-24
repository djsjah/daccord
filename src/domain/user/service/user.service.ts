import { Op } from 'sequelize';
import { NotFound, Forbidden } from 'http-errors';
import IUserRegister from '../../auth/validation/interface/user.register.interface';
import IUserUpdate from '../validation/interface/user.update.interface';
import User from '../../../database/models/user/user.model';
import UserContact from '../../../database/models/user/user.contact.model';
import Post from '../../../database/models/post/post.model';
import Subscription from '../../../database/models/subscription/subscription.model';
import CryptoProvider from '../../../utils/lib/crypto/crypto.provider';

class UserService {
  private readonly cryptoProvider: CryptoProvider;

  private readonly userAssociations = [
    { model: Post, as: 'posts' },
    { model: UserContact, as: 'contacts' },
    {
      model: Subscription,
      as: 'subscribers'
    }
  ];

  constructor(cryptoProvider: CryptoProvider) {
    this.cryptoProvider = cryptoProvider;
  }

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

  public async getUserById(userId: string, nonActivated = false): Promise<User> {
    const user = await User.findOne({
      where: { id: userId },
      include: this.userAssociations
    });

    if (user && !nonActivated && !user.isActivated) {
      throw new Forbidden("Forbidden - this account is not activated");
    }

    if (!user) {
      throw new NotFound(`User with id: ${userId} - is not found`);
    }

    return user;
  }

  public async getUserByEmail(userEmail: string): Promise<User> {
    const user = await User.findOne({
      where: { email: userEmail },
      include: this.userAssociations
    });

    if (user && !user.isActivated) {
      throw new Forbidden("Forbidden - this account is not activated");
    }

    if (!user) {
      throw new NotFound(`User with email: ${userEmail} - is not found`);
    }

    return user;
  }

  public async createUser(userDataCreate: IUserRegister): Promise<User> {
    userDataCreate.password = await this.cryptoProvider.hashStringBySHA256(userDataCreate.password);
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

    return this.getUserById(newUser.id, true);
  }

  public async updateUserById(userId: string, newUserData: IUserUpdate, nonActivated = false): Promise<User> {
    const user = await this.getUserById(userId, nonActivated);
    Object.assign(user, newUserData);
    await user.save();

    return user;
  }

  public async deleteUserById(userId: string): Promise<void> {
    const user = await this.getUserById(userId, true);
    await user.destroy();
  }
}
export default UserService;
