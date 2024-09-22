import { FindOptions } from 'sequelize';
import { NotFound } from 'http-errors';
import UserContact from '../../../database/sequelize/models/user/user.contact.model';
import DomainService from '../../domain.service.abstract';
import IRoleSettings from '../../role.settings.interface';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IUserContactCreate from '../validation/interface/contact/contact.create.interface';
import IUserContactUpdate from '../validation/interface/contact/contact.update.interface';
import ContactPublicFields from '../validation/enum/contact.public.fields.enum';
import UserRole from '../validation/enum/user.role.enum';

class UserContactService extends DomainService {
  private readonly contactPublicFields: ContactPublicFields[] = Object.values(ContactPublicFields);

  protected override readonly roleSettings: IRoleSettings = {
    admin: {},
    user: {
      attributes: this.contactPublicFields
    }
  };

  protected override modelRoleFilter(userContact: UserContact, userRole: UserRole): Partial<UserContact> {
    return userRole === 'user' ?
      Object.fromEntries(
        Object.entries(userContact)
          .filter(([key]) => this.contactPublicFields.includes(key as ContactPublicFields))
      ) : userContact;
  }

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
  ): Promise<Partial<UserContact>>
  {
    const newUserContact = await UserContact.create({
      ...userContactDataCreate,
      userId: user.id
    });

    return this.modelRoleFilter(newUserContact, user.role);
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
