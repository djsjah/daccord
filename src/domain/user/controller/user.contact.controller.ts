import { NextFunction, Request, Response } from 'express';
import { UserGetByIdSchema } from '../validation/schema/user.get.schema';
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
      const userId = req.params.userId;
      const { error } = UserGetByIdSchema.validate(userId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const userContacts = await this.userContactService.getAllUserContactsByUserId(
        searchSubstring as string,
        userId
      );

      return res.status(200).json({
        status: 200,
        data: userContacts,
        message: `List of all contacts of user with id ${userId}`
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
}
export default UserContactController;
