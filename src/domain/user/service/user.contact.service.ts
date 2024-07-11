import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import User from '../../../database/models/user/user.model';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import UserContact from '../../../database/models/user/user.contact.model';
import IUserContactCreate from '../validation/interface/user.contact.create.interface';
import IUserContactUpdate from '../validation/interface/update/user.contact.update.interface';

class UserContactService {
  private readonly userContactAssociations = [
    { model: User, as: 'user' }
  ];

  private readonly publicUserContactData = [
    'id',
    'type',
    'value'
  ];

  public async getAllUsersContacts(searchSubstring: string): Promise<UserContact[]> {
    let userContacts = [];

    if (!searchSubstring) {
      userContacts = await UserContact.findAll({
        include: this.userContactAssociations
      });
    }
    else {
      userContacts = await UserContact.findAll({
        where: {
          [Op.or]: [
            { type: { [Op.like]: `%${searchSubstring}%` } },
            { value: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        include: this.userContactAssociations
      });

      if (userContacts.length === 0) {
        throw new NotFound(`User contacts by search substring: ${searchSubstring} - are not found`);
      }
    }

    return userContacts;
  }

  public async getAllUserContactsByUserId(
    user: IUserPayload,
    searchSubstring: string = ''
  ): Promise<UserContact[]> {
    let userContacts: UserContact[] = [];

    if (!searchSubstring) {
      userContacts = await UserContact.findAll({
        where: {
          userId: user.id
        },
        attributes: this.publicUserContactData
      });
    }
    else {
      userContacts = await UserContact.findAll({
        where: {
          userId: user.id,
          [Op.or]: [
            { type: { [Op.like]: `%${searchSubstring}%` } },
            { value: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        attributes: this.publicUserContactData
      });
    }

    return userContacts;
  }

  public async getUserContactById(
    user: IUserPayload,
    userContactId: string,
    isMainData: boolean = false
  ): Promise<UserContact> {
    let userContact;

    if (user.role === 'admin' && !isMainData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId
        },
        include: this.userContactAssociations
      });
    }
    else if (user.role === 'admin' && isMainData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId
        }
      });
    }
    else if (user.role === 'user' && !isMainData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId,
          userId: user.id
        },
        attributes: this.publicUserContactData
      });
    }
    else if (user.role === 'user' && isMainData) {
      userContact = await UserContact.findOne({
        where: {
          id: userContactId,
          userId: user.id
        }
      });
    }

    if (!userContact) {
      throw new NotFound(`Contact with id: ${userContactId} - is not found`);
    }

    return userContact;
  }

  public async createUserContactByUserId(
    user: IUserPayload,
    userContactDataCreate: IUserContactCreate
  ): Promise<UserContact> {
    const newUserContact = await UserContact.create({
      ...userContactDataCreate,
      userId: user.id
    });

    return (
      await this.getUserContactById(user, newUserContact.id)
    );
  }

  public async updateUserContactById(
    user: IUserPayload,
    userContactId: string,
    newUserContactData: IUserContactUpdate
  ): Promise<UserContact> {
    if (user.role === 'admin') {
      await UserContact.update(newUserContactData, {
        where: {
          id: userContactId
        }
      })
    }
    else if (user.role === 'user') {
      await UserContact.update(newUserContactData, {
        where: {
          id: userContactId,
          userId: user.id
        }
      })
    }

    return (
      await this.getUserContactById(user, userContactId)
    );
  }

  public async deleteUserContactById(user: IUserPayload, userContactId: string): Promise<void> {
    const userContact = await this.getUserContactById(user, userContactId, true);
    await userContact.destroy();
  }

  public async deleteUserContact(userContact: UserContact): Promise<void> {
    await userContact.destroy();
  }
}
export default UserContactService;
