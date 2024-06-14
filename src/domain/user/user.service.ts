import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IUser from './validation/interface/user.interface';
import User from '../../models/user/user.model';
import UserContact from '../../models/user/user.contact.model';
import Post from '../../models/post/post.model';
import Subscription from '../../models/subscription/subscription.model';

class UserService {
  private readonly userAssociations = [
    { model: Post, as: 'posts' },
    { model: UserContact, as: 'contacts' },
    {
      model: Subscription,
      as: 'subscribers'
    }
  ];

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

  public async createUser(userData: IUser): Promise<User | never> {
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
}
export default UserService;
