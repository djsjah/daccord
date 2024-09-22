import { Op } from 'sequelize';
import { NextFunction, Request, Response } from 'express';
import { IdSchemaRequired } from '../../validation/joi/schema/joi.params.schema';
import UserContactService from '../service/user.contact.service';
import JoiRequestValidation from '../../validation/joi/decorator/joi.validation.decorator';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import UserContactCreateSchema from '../validation/schema/contact/contact.create.schema';
import UserContactUpdateSchema from '../validation/schema/contact/contact.update.schema';

class UserContactController {
  private readonly userContactService: UserContactService;

  constructor(userContactService: UserContactService) {
    this.userContactService = userContactService;
  }

  public async getAllUserContacts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const searchSubstring = req.query.search as string;
      let userContacts = [];

      if (!searchSubstring) {
        userContacts = await this.userContactService.getAllUserContacts({}, user);
      }
      else {
        userContacts = await this.userContactService.getAllUserContacts({
          where: {
            [Op.or]: [
              { type: { [Op.like]: `%${searchSubstring}%` } },
              { value: { [Op.like]: `%${searchSubstring}%` } }
            ]
          }
        }, user);
      }

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

  @JoiRequestValidation({
    type: 'params',
    name: 'userContactId'
  }, IdSchemaRequired)
  public async getUserContactById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const userContact = await this.userContactService.getUserContactByUniqueParams({
        where: {
          id: req.params.userContactId
        }
      }, user);

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

  @JoiRequestValidation({
    type: 'body'
  }, UserContactCreateSchema)
  public async createUserContact(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const newUserContact = await this.userContactService.createUserContact(
        user,
        req.body
      );

      return res.status(201).location(`/api/posts/${newUserContact.id}`).json(
        { status: 201, data: newUserContact, message: "Сontact successfully created" }
      );
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'userContactId'
  }, IdSchemaRequired)
  @JoiRequestValidation({
    type: 'body'
  }, UserContactUpdateSchema)
  public async updateUserContactById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const userContact = await this.userContactService.getUserContactByUniqueParams({
        where: {
          id: req.params.userContactId
        }
      }, user);

      const updatedUserContact = await this.userContactService.updateUserContact(
        userContact,
        req.body
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

  @JoiRequestValidation({
    type: 'params',
    name: 'userContactId'
  }, IdSchemaRequired)
  public async deleteUserContactById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const userContact = await this.userContactService.getUserContactByUniqueParams({
        where: {
          id: req.params.userContactId
        }
      }, user);

      await this.userContactService.deleteUserContact(userContact);
      return res.status(200).json({ status: 200, message: "Сontact successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserContactController;
