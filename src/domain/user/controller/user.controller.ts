import { NextFunction, Request, Response } from 'express';
import { UserGetByIdSchema } from '../validation/schema/user.get.schema';
import User from '../../../database/models/user/user.model';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import DomainController from '../../domain.controller.abstract';
import UserService from '../service/user.service';
import UserContactService from '../service/user.contact.service';
import UserPrivateUpdateSchema from '../validation/schema/update/private/user.private.update.schema';
import UserPublicUpdateSchema from '../validation/schema/update/public/user.public.update.schema';
import MailerTransporter from '../../../utils/lib/mailer/mailer.transporter';
import CryptoProvider from '../../../utils/lib/crypto/crypto.provider';
import JWTStrategy from '../../../utils/lib/jwt/jwt.strategy';

class UserController extends DomainController {
  constructor(
    private readonly userService: UserService,
    private readonly userContactService: UserContactService,
    private readonly mailerTransporter: MailerTransporter,
    private readonly cryptoProvider: CryptoProvider,
    private readonly jwtStrategy: JWTStrategy
  ) {
    super();
  }

  public async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search as string;
      const users = await this.userService.getAllUsers(searchSubstring);
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
      const newUserDataValid = UserPrivateUpdateSchema.validate(newUserData);

      if (newUserDataValid.error) {
        return res.status(422).send(`Validation error: ${newUserDataValid.error.details[0].message}`);
      }

      if (newUserData.password) {
        newUserData.password = await this.cryptoProvider.hashStringBySHA256(newUserData.password);
      }

      const user = await this.userService.getUserById(userId);
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

  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      let newUserData = req.body;
      const { error } = UserPublicUpdateSchema.validate(newUserData);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const userPayload = req.user as IUserPayload;
      const user = await this.userService.getUserById(userPayload.id);

      newUserData = await this.validateUserPassword(res, user, newUserData);
      newUserData = await this.validateUserEmail(user, userPayload, newUserData);
      newUserData = await this.isUpdateUserJWTTokens(res, user, newUserData);

      const updatedUser = await this.userService.updateUser(user, newUserData);

      return res.status(200).json({
        status: 200,
        data: updatedUser,
        message: "User successfully updated"
      });
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

      const user = await this.userService.getUserById(userId, false);
      await this.userService.deleteUser(user);
      return res.status(200).json({ status: 200, message: "User successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }

  public override async verifyUserEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const { token } = req.query;
      const user = await this.userService.getUserByUniqueParams({
        verifToken: token as string
      });

      const userContacts = await this.userContactService.getAllUserContacts({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'user' | 'admin'
      }, 'newEmail');

      const newUserEmail = userContacts[0].value;
      const newUserData = await this.updateUserJWTTokens(
        res,
        {
          email: newUserEmail,
          verifToken: null
        },
        {
          id: user.id,
          name: user.name,
          email: newUserEmail,
          role: user.role as 'admin' | 'user'
        }
      );

      await this.userService.updateUser(user, newUserData, false);
      await this.userContactService.deleteUserContact(userContacts[0]);

      return res.redirect(process.env.CUR_URL + '/api');
    }
    catch (err) {
      next(err);
    }
  }

  public async validateUserPassword(res: Response, user: User, newUserData: any) {
    const hashOldPassword = newUserData.oldPassword ?
      await this.cryptoProvider.hashStringBySHA256(newUserData.oldPassword) : null;

    if (
      (newUserData.newPassword && !newUserData.oldPassword) ||
      (!newUserData.newPassword && newUserData.oldPassword)
    ) {
      return res.status(422).send(
        "Validation error: When changing your password, you must enter both the new password and the old one"
      );
    }
    else if (newUserData.newPassword && hashOldPassword !== user.password) {
      return res.status(422).send("Validation error: old password is incorrect");
    }
    else if (newUserData.newPassword) {
      const hashNewPassword = await this.cryptoProvider.hashStringBySHA256(newUserData.newPassword);
      delete newUserData.newPassword;
      delete newUserData.oldPassword;

      return {
        ...newUserData,
        password: hashNewPassword
      };
    }

    return newUserData;
  }

  public async validateUserEmail(user: User, userPayload: IUserPayload, newUserData: any) {
    if (user.role !== 'admin' && newUserData.email && newUserData.email !== user.email) {
      const verifToken = this.cryptoProvider.generateSecureVerificationToken();
      const verifLink = process.env.CUR_URL + `/api/users/verifyUserEmail?token=${verifToken}`;

      await this.mailerTransporter.sendMailByTransporter({
        to: newUserData.email,
        subject: 'Verify your email',
        html: `<p>Hello, it's <strong>Daccord Service!</strong> You are trying to change your email.</p><br>
        <p>Please confirm your new email by clicking on the link: <strong><a style="text-decoration: underline;" href="${verifLink}">Change your email</a></strong></p>`
      });

      const userNewEmails = await this.userContactService.getAllUserContacts({
        id: userPayload.id,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role
      }, 'newEmail');

      if (userNewEmails.length > 0) {
        await this.userContactService.deleteUserContact(userNewEmails[0]);
      }

      await this.userContactService.createUserContactByUserId(userPayload, {
        type: 'newEmail',
        value: newUserData.email
      });

      delete newUserData.email;

      return {
        ...newUserData,
        verifToken: verifToken
      };
    }

    return newUserData;
  }

  public async updateUserJWTTokens(
    res: Response,
    newUserData: any,
    userUpdatedPayload: IUserPayload
  ) {
    const accessToken = await this.jwtStrategy.createJWTToken(userUpdatedPayload);
    const refreshToken = await this.jwtStrategy.createJWTToken(userUpdatedPayload, false);

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 900000
    })
      .cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 259200000
      });

    return {
      ...newUserData,
      refreshToken: refreshToken
    };
  }

  public async isUpdateUserJWTTokens(res: Response, user: User, newUserData: any) {
    let isUpdateUserJWTTokens = false;
    const userUpdatedPayload: IUserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'user'
    };

    if (user.role === 'admin' && newUserData.email && user.email !== newUserData.email) {
      userUpdatedPayload.email = newUserData.email;
      isUpdateUserJWTTokens = true;
    }

    if (newUserData.name && newUserData.name !== user.name) {
      userUpdatedPayload.name = newUserData.name;
      isUpdateUserJWTTokens = true;
    }

    if (isUpdateUserJWTTokens) {
      return (
        await this.updateUserJWTTokens(res, newUserData, userUpdatedPayload)
      );
    }

    return newUserData;
  }
}
export default UserController;
