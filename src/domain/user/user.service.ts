import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IUserCreate from './validation/interface/user.create.interface';
import IUserUpdate from './validation/interface/user.update.interface';
import User from '../../models/user/user.model';
import UserContact from '../../models/user/user.contact.model';
import Post from '../../models/post/post.model';
import Subscription from '../../models/subscription/subscription.model';
import CryptoProvider from '../../crypto/crypto.provider';

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

  public async getAllUsers(searchSubstring: string): Promise<User[] | never> {
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

  public async getUserById(id: string): Promise<User | never> {
    const user = await User.findOne({
      where: { id },
      include: this.userAssociations
    });
    if (!user) {
      throw new NotFound(`User with id: ${id} - is not found`);
    }

    return user;
  }

  public async getUserByEmail(email: string): Promise<User | never> {
    const user = await User.findOne({
      where: { email },
      include: this.userAssociations
    });
    if (!user) {
      throw new NotFound(`User with email: ${email} - is not found`);
    }

    return user;
  }

  public async createUser(userData: IUserCreate): Promise<User | never> {
    userData.password = await this.cryptoProvider.hashStringBySHA256(userData.password);
    const newUser = await User.create({
      ...userData
    });

    if (userData.contacts) {
      const contactsData = userData.contacts.map((contact) => ({
        type: contact.type,
        value: contact.value,
        userId: newUser.id
      }));

      await UserContact.bulkCreate(contactsData);
    }

    return this.getUserById(newUser.id);
  }

  public async updateUserById(id: string, newUserData: IUserUpdate): Promise<User | never> {
    const user = await this.getUserById(id);
    Object.assign(user, newUserData);
    await user.save();

    return user;
  }

  public async deleteUserById(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await user.destroy();
  }
}
export default UserService;
