import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import UserModel from '../../database/schema/user/user.model';
import UserContactModel from '../../database/schema/user/user.contact.model';
import UserDTO from './dto/user.dto';

@Injectable()
class UserService {
  constructor(@InjectModel(UserModel) private readonly userModel: typeof UserModel) { }

  async getAllUsers(searchSubstring: string): Promise<UserModel[] | never> {
    let users = [];
    if (!searchSubstring) {
      users = await this.userModel.findAll();
    }
    else {
      users = await this.userModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchSubstring}%` } },
            { email: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (users.length === 0) {
        throw new NotFoundException(`Users by search substring: ${searchSubstring} - not found`);
      }
    }

    return users;
  }

  async getUserById(id: string): Promise<UserModel | never> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} - not found`);
    }

    return user;
  }

  async createUser(userData: UserDTO): Promise<UserModel | never> {
    const newUser = await this.userModel.create({
      name: userData.name,
      role: userData.role,
      email: userData.email,
      password: userData.password,
      rating: userData.rating
    });

    if (userData.contacts) {
      const contactsData = userData.contacts.map(contact => ({
        type: contact.type,
        value: contact.value,
        userId: newUser.id
      }));

      await UserContactModel.bulkCreate(contactsData);
    }

    return newUser;
  }

  async completelyUpdateUser() { }

  async partiallyUpdateUser() { }

  async removeUser() { }
}
export default UserService;
