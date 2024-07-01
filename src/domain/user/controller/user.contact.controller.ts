import { NextFunction, Request, Response } from 'express';
import { UserGetByStringSchema, UserGetByIdSchema } from '../validation/schema/user.get.schema';
import UserContactSchema from '../validation/schema/user.contact.schema';
import UserContactService from '../service/user.contact.service';

class UserContactController {
  private readonly userContactService: UserContactService;

  constructor(userContactService: UserContactService) {
    this.userContactService = userContactService;
  }

  public async getAllUsersContacts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const userContacts = await this.userContactService.getAllUsersContacts(searchSubstring as string);
      return res.status(200).json({
        status: 200,
        data: userContacts,
        message: "List of all contacts of all users"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async getAllUserContactsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const userId = req.session.user?.id || '';
      const { error } = UserGetByIdSchema.validate(userId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const userContacts = await this.userContactService.getAllUserContactsByUserId(
        userId,
        searchSubstring as string
      );

      return res.status(200).json({
        status: 200,
        data: userContacts,
        message: `List of all your contacts`
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

      const userContact = await this.userContactService.getUserContactById(userContactId);
      return res.status(200).json({ status: 200, data: userContact, message: "User contact details" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserContactByValue(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userContactValue = req.params.userContactValue;
      const { error } = UserGetByStringSchema.validate(userContactValue);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const userId = req.session.user?.id || '';
      const userContact = await this.userContactService.getUserContactByValue(userId, userContactValue);
      return res.status(200).json({ status: 200, data: userContact, message: "User contact details" });
    }
    catch (err) {
      next(err);
    }
  }

  public async createUserContact(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userContactDataCreate = req.body;
      const { error } = UserContactSchema.validate(userContactDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const userId = req.session.user?.id || '';
      const newUserContact = await this.userContactService.createUserContactByUserId(
        userId,
        userContactDataCreate
      );

      return res.status(201).location(`/api/posts/${newUserContact.id}`).json(
        { status: 201, data: newUserContact, message: "User contact successfully created" }
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
      const newUserContactDataValid = UserContactSchema.validate(newUserContactData);

      if (newUserContactDataValid.error) {
        return res.status(422).send(`Validation error: ${newUserContactDataValid.error.details[0].message}`);
      }

      const updatedUserContact = await this.userContactService.updateUserContactById(
        userContactId,
        newUserContactData
      );

      return res.status(200).json({
        status: 200,
        data: updatedUserContact,
        message: "User contact successfully updated"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async updateUserContactByValue(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userContactValue = req.params.userContactValue;
      const userContactValueValid = UserGetByStringSchema.validate(userContactValue);

      if (userContactValueValid.error) {
        return res.status(422).send(`Validation error: ${userContactValueValid.error.details[0].message}`);
      }

      const newUserContactData = req.body;
      const newUserContactDataValid = UserContactSchema.validate(newUserContactData);

      if (newUserContactDataValid.error) {
        return res.status(422).send(`Validation error: ${newUserContactDataValid.error.details[0].message}`);
      }

      const userId = req.session.user?.id || '';
      const updatedUserContact = await this.userContactService.updateUserContactByValue(
        userId,
        userContactValue,
        newUserContactData
      );

      return res.status(200).json({
        status: 200,
        data: updatedUserContact,
        message: "User contact successfully updated"
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

      await this.userContactService.deleteUserContactById(userContactId);
      return res.status(200).json({ status: 200, message: "User contact successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteUserContactByValue(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userContactValue = req.params.userContactValue;
      const { error } = UserGetByStringSchema.validate(userContactValue);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const userId = req.session.user?.id || '';
      await this.userContactService.deleteUserContactByValue(userId, userContactValue);
      return res.status(200).json({ status: 200, message: "User contact successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserContactController;
