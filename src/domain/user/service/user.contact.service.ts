import { FindOptions } from 'sequelize';
import { NotFound } from 'http-errors';
import User from '../../../database/models/user/user.model';
import UserContact from '../../../database/models/user/user.contact.model';
import DomainService from '../../domain.service.abstract';
import IRoleSettings from '../../role.settings.interface';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IUserContactCreate from '../validation/interface/user.contact.create.interface';
import IUserContactUpdate from '../validation/interface/update/user.contact.update.interface';

class UserContactService extends DomainService {
  protected override readonly roleSettings: IRoleSettings = {
    admin: {
      include: [
        { model: User, as: 'user' }
      ]
    },
    user: {
      attributes: [
        'id',
        'type',
        'value'
      ]
    }
  };

  protected override findOptionsRoleFilter(findOptions: FindOptions, user: IUserPayload): FindOptions {
    const roleSpecificOptions = this.roleSettings[user.role];
    if (user.role === 'user') {
      findOptions.where = {
        ...findOptions.where,
        userId: user.id
      }
    }

    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  public async getAllUserContacts(findOptions: FindOptions, user?: IUserPayload): Promise<UserContact[]> {
    findOptions = user ?
      this.findOptionsRoleFilter(findOptions, user) :
      findOptions;

    const userContacts = await UserContact.findAll(findOptions);
    return userContacts;
  }

  public async getUserContactByUniqueParams(
    findOptions: FindOptions,
    user?: IUserPayload
  ): Promise<UserContact>
  {
    findOptions = user ?
      this.findOptionsRoleFilter(findOptions, user) :
      findOptions;

    const userContact = await UserContact.findOne(findOptions);

    if (!userContact) {
      throw new NotFound("User contact is not found");
    }

    return userContact;
  }

  public async createUserContact(
    user: IUserPayload,
    userContactDataCreate: IUserContactCreate
  ): Promise<UserContact>
  {
    const newUserContact = await UserContact.create({
      ...userContactDataCreate,
      userId: user.id
    });

    return (
      await this.getUserContactByUniqueParams({
        where: {
          id: newUserContact.id
        }
      }, user)
    );
  }

  public async updateUserContact(
    userContact: UserContact,
    newUserContactData: IUserContactUpdate
  ): Promise<UserContact>
  {
    Object.assign(userContact, newUserContactData);
    await userContact.save();
    return userContact;
  }

  public async deleteUserContact(userContact: UserContact): Promise<void> {
    await userContact.destroy();
  }
}
export default UserContactService;
