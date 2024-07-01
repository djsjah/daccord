import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import User from '../../../database/models/user/user.model';
import UserContact from '../../../database/models/user/user.contact.model';
import IUserContact from '../validation/interface/user.contact.interface';
import UserService from './user.service';

class UserContactService {
  private readonly userService: UserService;
  private readonly userContactAssociations = [
    { model: User, as: 'user' }
  ];

  private readonly publicUserContactData = [
    'type',
    'value'
  ];

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

  public async getAllUserContactsByUserId(userId: string, searchSubstring: string = ''): Promise<UserContact[]> {
    await this.userService.getUserById(userId);

    let userContacts = [];
    if (!searchSubstring) {
      userContacts = await UserContact.findAll({
        where: {
          userId
        },
        attributes: this.publicUserContactData
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
        },
        attributes: this.publicUserContactData
      });

      if (userContacts.length === 0) {
        throw new NotFound(
          `For user with id: ${userId}, contacts by search substring: ${searchSubstring} - are not found`
        );
      }
    }

    return userContacts;
  }

  public async getUserContactById(
    userContactId: string,
    includeAssociations = true,
    isPublicData = false
  ): Promise<UserContact> {
    let userContact;

    if (includeAssociations && !isPublicData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId
        },
        include: this.userContactAssociations
      });
    }
    else if (!includeAssociations && !isPublicData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId
        }
      });
    }
    else if (!includeAssociations && isPublicData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId
        },
        attributes: this.publicUserContactData
      });
    }

    if (!userContact) {
      throw new NotFound(`User contact with id: ${userContactId} - is not found`);
    }

    return userContact;
  }

  public async getUserContactByValue(userId: string, value: string, isPublicData = true): Promise<UserContact> {
    let userContact;

    if (isPublicData) {
      userContact = await UserContact.findOne({
        where: {
          value,
          userId
        },
        attributes: this.publicUserContactData
      });
    }
    else {
      userContact = await UserContact.findOne({
        where: {
          value,
          userId
        }
      });
    }

    if (!userContact) {
      throw new NotFound(`User contact with value: ${value} - is not found`);
    }

    return userContact;
  }

  public async createUserContactByUserId(
    userId: string,
    userContactDataCreate: IUserContact
  ): Promise<UserContact> {
    const newUserContact = await UserContact.create({
      ...userContactDataCreate,
      userId: userId
    });

    return (
      await this.getUserContactById(newUserContact.id, false, true)
    );
  }

  public async updateUserContactById(
    userContactId: string,
    newUserContactData: IUserContact
  ): Promise<UserContact> {
    const userContact = await this.getUserContactById(userContactId, false);
    Object.assign(userContact, newUserContactData);
    await userContact.save();

    return (
      await this.getUserContactById(userContact.id)
    );
  }

  public async updateUserContactByValue(
    userId: string,
    value: string,
    newUserContactData: IUserContact
  ): Promise<UserContact> {
    const userContact = await this.getUserContactByValue(userId, value, false);
    Object.assign(userContact, newUserContactData);
    await userContact.save();

    return (
      await this.getUserContactById(userContact.id, false, true)
    );
  }

  public async deleteUserContactById(userContactId: string): Promise<void> {
    const userContact = await this.getUserContactById(userContactId, false, false);
    await userContact.destroy();
  }

  public async deleteUserContactByValue(userId: string, value: string): Promise<void> {
    const userContact = await this.getUserContactByValue(userId, value, false);
    await userContact.destroy();
  }

  public async deleteUserContact(userContact: UserContact): Promise<void> {
    await userContact.destroy();
  }
}
export default UserContactService;
