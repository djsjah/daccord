import { NextFunction, Request, Response } from 'express';
import UserService from './user.service';
import UserSchema from './validation/schema/user.schema';

class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const searchSubstring = req.query.search || '';
      const users = await this.userService.getAllUsers(searchSubstring as string);

      if (!res.headersSent) {
        return res.status(200).json({ status: 200, data: users, message: "List of all users" });
      }
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const user = await this.userService.getUserById(id);

      if (user) {
        return res.status(200).json({ status: 200, data: user, message: "User details" });
      }
    }
    catch (err) {
      next(err);
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const { error } = UserSchema.validate(userData);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const newUser = await this.userService.createUser(userData);

      if (newUser) {
        return res.status(201).location(`/api/users/${newUser.id}`).json(
          { status: 201, data: newUser, message: "User successfully created" }
        );
      }
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserController;
