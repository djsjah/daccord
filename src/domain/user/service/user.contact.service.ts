import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IUserContact from '../validation/interface/user.contact.interface';
import UserService from './user.service';
import UserContact from '../../../database/models/user/user.contact.model';

class UserContactService {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async getAllUsersContacts(searchSubstring: string): Promise<UserContact[]> {
    let userContacts = [];
    if (!searchSubstring) {
      userContacts = await UserContact.findAll();
    }
    else {
      userContacts = await UserContact.findAll({
        where: {
          [Op.or]: [
            { type: { [Op.like]: `%${searchSubstring}%` } },
            { value: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (userContacts.length === 0) {
        throw new NotFound(`User contacts by search substring: ${searchSubstring} - are not found`);
      }
    }

    return userContacts;
  }

  public async getAllUserContactsByUserId(searchSubstring: string, userId: string): Promise<UserContact[]> {
    await this.userService.getUserById(userId);

    let userContacts = [];
    if (!searchSubstring) {
      userContacts = await UserContact.findAll({
        where: {
          userId
        }
      });
    }
    else {
      userContacts = await UserContact.findAll({
        where: {
          userId,
          [Op.or]: [
            { type: { [Op.like]: `%${searchSubstring}%` } },
            { value: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (userContacts.length === 0) {
        throw new NotFound(
          `For user with id: ${userId}, contacts by search substring: ${searchSubstring} - are not found`
        );
      }
    }

    return userContacts;
  }

  public async getUserContactById(userContactId: string): Promise<UserContact> {
    const userContact = await UserContact.findOne({
      where: {
        id: userContactId
      }
    });

    if (!userContact) {
      throw new NotFound(`User contact with id: ${userContactId} - is not found`);
    }

    return userContact;
  }

  public async updateUserContactById(
    userContactId: string,
    newUserContactData: IUserContact
  ): Promise<UserContact> {
    const userContact = await this.getUserContactById(userContactId);
    Object.assign(userContact, newUserContactData);
    await userContact.save();

    return userContact;
  }

  public async deleteUserContactById(userContactId: string): Promise<void> {
    const userContact = await this.getUserContactById(userContactId);
    await userContact.destroy();
  }
}
export default UserContactService;
