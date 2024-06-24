import { NextFunction, Request, Response } from 'express';
import { UserGetByIdSchema } from '../validation/schema/user.get.schema';
import UserService from '../service/user.service';
import UserUpdateSchema from '../validation/schema/user.update.schema';

class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const users = await this.userService.getAllUsers(searchSubstring as string);
      return res.status(200).json({ status: 200, data: users, message: "List of all users" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.params.userId;
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

  public async updateUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.params.userId;
      const userIdValid = UserGetByIdSchema.validate(userId);

      if (userIdValid.error) {
        return res.status(422).send(`Validation error: ${userIdValid.error.details[0].message}`);
      }

      const newUserData = req.body;
      const newUserDataValid = UserUpdateSchema.validate(newUserData);

      if (newUserDataValid.error) {
        return res.status(422).send(`Validation error: ${newUserDataValid.error.details[0].message}`);
      }

      const updatedUser = await this.userService.updateUserById(userId, newUserData);
      return res.status(200).json({ status: 200, data: updatedUser, message: "User successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.params.userId;
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
