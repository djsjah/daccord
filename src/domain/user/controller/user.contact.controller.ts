import { NextFunction, Request, Response } from 'express';
import { UserGetByIdSchema } from '../validation/schema/user.get.schema';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import UserContactCreateSchema from '../validation/schema/user.contact.create.schema';
import UserContactUpdateSchema from '../validation/schema/update/user.contact.update.schema';
import UserContactService from '../service/user.contact.service';

class UserContactController {
  private readonly userContactService: UserContactService;

  constructor(userContactService: UserContactService) {
    this.userContactService = userContactService;
  }

  public async getAllUserContacts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const searchSubstring = req.query.search as string;
      const userContacts = await this.userContactService.getAllUserContacts(
        user,
        searchSubstring
      );

      return res.status(200).json({
        status: 200,
        data: userContacts,
        message: "List of all contacts"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserContactById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userContactId = req.params.userContactId;
      const { error } = UserGetByIdSchema.validate(userContactId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const userContact = await this.userContactService.getUserContactById(user, userContactId);
      return res.status(200).json({
        status: 200,
        data: userContact,
        message: `Сontact details with id: ${userContact.id}`
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async createUserContact(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userContactDataCreate = req.body;
      const { error } = UserContactCreateSchema.validate(userContactDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const newUserContact = await this.userContactService.createUserContactByUserId(
        user,
        userContactDataCreate
      );

      return res.status(201).location(`/api/posts/${newUserContact.id}`).json(
        { status: 201, data: newUserContact, message: "Сontact successfully created" }
      );
    }
    catch (err) {
      next(err);
    }
  }

  public async updateUserContactById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userContactId = req.params.userContactId;
      const userContactIdValid = UserGetByIdSchema.validate(userContactId);

      if (userContactIdValid.error) {
        return res.status(422).send(`Validation error: ${userContactIdValid.error.details[0].message}`);
      }

      const newUserContactData = req.body;
      const newUserContactDataValid = UserContactUpdateSchema.validate(newUserContactData);

      if (newUserContactDataValid.error) {
        return res.status(422).send(`Validation error: ${newUserContactDataValid.error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const updatedUserContact = await this.userContactService.updateUserContactById(
        user,
        userContactId,
        newUserContactData
      );

      return res.status(200).json({
        status: 200,
        data: updatedUserContact,
        message: "Сontact successfully updated"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteUserContactById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userContactId = req.params.userContactId;
      const { error } = UserGetByIdSchema.validate(userContactId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const userContact = await this.userContactService.getUserContactById(user, userContactId, true);
      await this.userContactService.deleteUserContact(userContact);

      return res.status(200).json({ status: 200, message: "Сontact successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserContactController;
