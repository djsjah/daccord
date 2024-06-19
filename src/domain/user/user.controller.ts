import { NextFunction, Request, Response } from 'express';
import {
  UserGetByIdSchema,
  UserGetByEmailSchema,
  UserGetByPasswordSchema
} from './validation/schema/user.get.schema';
import createHttpError from 'http-errors';
import UserService from './user.service';
import UserCreateSchema from './validation/schema/user.create.schema';
import UserUpdateSchema from './validation/schema/user.update.schema';
import IUserCreate from './validation/interface/user.create.interface';

class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public isReqUserDataCreateValid(req: Request, res: Response): void | Response {
    const userDataCreate = req.body;
    const { error } = UserCreateSchema.validate(userDataCreate);

    if (error) {
      return res.status(422).send(`Validation error: ${error.details[0].message}`);
    }
  }

  public async createUser(userDataCreate: IUserCreate) {
    return await this.userService.createUser(userDataCreate);
  }

  public async getUserByEmail(req: Request) {
    const userEmail = req.query.userEmail as string;
    const userPassword = req.query.userPassword;

    const userEmailValid = UserGetByEmailSchema.validate(userEmail);
    const userPasswordValid = UserGetByPasswordSchema.validate(userPassword);

    if (userEmailValid.error) {
      throw createHttpError(422, `Validation error: ${userEmailValid.error.details[0].message}`);
    }

    if (userPasswordValid.error) {
      throw createHttpError(422, `Validation error: ${userPasswordValid.error.details[0].message}`);
    }

    return await this.userService.getUserByEmail(userEmail);
  }

  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const searchSubstring = req.query.search || '';
      const users = await this.userService.getAllUsers(searchSubstring as string);
      return res.status(200).json({ status: 200, data: users, message: "List of all users" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const { error } = UserGetByIdSchema.validate(userId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = await this.userService.getUserById(userId);
      return res.status(200).json({ status: 200, data: user, message: "User details" });
    }
    catch (err) {
      next(err);
    }
  }

  public async updateUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const newUserData = req.body;

      const idValidError = UserGetByIdSchema.validate(userId);
      const bodyValidError = UserUpdateSchema.validate(newUserData);

      if (idValidError.error) {
        return res.status(422).send(`Validation error: ${idValidError.error.details[0].message}`);
      }

      if (bodyValidError.error) {
        return res.status(422).send(`Validation error: ${bodyValidError.error.details[0].message}`);
      }

      const updatedUser = await this.userService.updateUserById(userId, newUserData);
      return res.status(200).json({ status: 200, data: updatedUser, message: "User successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const { error } = UserGetByIdSchema.validate(userId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      await this.userService.deleteUserById(userId);
      return res.status(200).json({ status: 200, message: "User successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserController;
