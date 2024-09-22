import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import { IdSchemaRequired } from '../../validation/joi/schema/joi.params.schema';
import UserService from '../service/user.service';
import CryptoProvider from '../../../utils/lib/crypto/crypto.provider';
import JoiRequestValidation from '../../validation/joi/decorator/joi.validation.decorator';
import UserRole from '../validation/enum/user.role.enum';
import AdminUpdateSchema from '../validation/schema/admin.update.schema';

class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cryptoProvider: CryptoProvider
  ) { }

  public async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search;
      let users = [];

      if (!searchSubstring) {
        users = await this.userService.getAllUsers({}, UserRole.admin);
      }
      else {
        users = await this.userService.getAllUsers({
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${searchSubstring}%` } },
              { email: { [Op.like]: `%${searchSubstring}%` } }
            ]
          }
        }, UserRole.admin);
      }

      return res.status(200).json({ status: 200, data: users, message: "List of all users" });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'userId'
  }, IdSchemaRequired)
  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = await this.userService.getUserByUniqueParams({
        where: {
          id: req.params.userId
        }
      }, UserRole.admin);

      return res.status(200).json({ status: 200, data: user, message: "User details" });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'userId'
  }, IdSchemaRequired)
  @JoiRequestValidation({
    type: 'body'
  }, AdminUpdateSchema)
  public async updateUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const newUserData = req.body;
      if (newUserData.password) {
        newUserData.password = await this.cryptoProvider.hashStringBySHA256(newUserData.password);
      }

      const user = await this.userService.getUserByUniqueParams({
        where: {
          id: req.params.userId
        }
      });

      const updatedUser = await this.userService.updateUser(user, {
        ...newUserData,
        refreshToken: null
      });

      return res.status(200).json({ status: 200, data: updatedUser, message: "User successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'userId'
  }, IdSchemaRequired)
  public async deleteUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = await this.userService.getUserByUniqueParams({
        where: {
          id: req.params.userId
        }
      });

      await this.userService.deleteUser(user);
      return res.status(200).json({ status: 200, message: "User successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserController;
