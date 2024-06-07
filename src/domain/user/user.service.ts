import { NextFunction, Response } from 'express';
import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IUser from './validation/interface/user.interface';
import User from '../../database/schema/user/user.model';
import UserContact from '../../database/schema/user/user.contact.model';

class UserService {
  public async getAllUsers(searchSubstring: string, next: NextFunction): Promise<User[]> {
    let users = [];
    if (!searchSubstring) {
      users = await User.findAll();
    }
    else {
      users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchSubstring}%` } },
            { email: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (users.length === 0) {
        next(new NotFound(`Users by search substring: ${searchSubstring} - are not found`));
      }
    }

    return users;
  }

  public async getUserById(id: string, next: NextFunction): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) {
      next(new NotFound(`User with id: ${id} - is not found`));
    }

    return user;
  }

  public async createUser(userData: IUser): Promise<User> {
    const newUser = await User.create({
      name: userData.name,
      role: userData.role,
      email: userData.email,
      password: userData.password,
      rating: userData.rating
    });

    if (userData.contacts) {
      const contactsData = userData.contacts.map((contact) => ({
        type: contact.type,
        value: contact.value,
        userId: newUser.id
      }));

      await UserContact.bulkCreate(contactsData);
    }

    return newUser;
  }
}
export default UserService;
