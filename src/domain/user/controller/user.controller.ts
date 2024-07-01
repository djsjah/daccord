import { NextFunction, Request, Response } from 'express';
import { UserGetByIdSchema } from '../validation/schema/user.get.schema';
import User from '../../../database/models/user/user.model';
import DomainController from '../../domain.controller.abstract';
import UserService from '../service/user.service';
import UserContactService from '../service/user.contact.service';
import UserPrivateUpdateSchema from '../validation/schema/update/private/user.private.update.schema';
import UserPublicUpdateSchema from '../validation/schema/update/public/user.public.update.schema';
import MailerTransporter from '../../../utils/lib/mailer/mailer.transporter';
import CryptoProvider from '../../../utils/lib/crypto/crypto.provider';

class UserController extends DomainController {
  constructor(
    private readonly userService: UserService,
    private readonly userContactService: UserContactService,
    private readonly mailerTransporter: MailerTransporter,
    private readonly cryptoProvider: CryptoProvider
  ) {
    super();
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
      const newUserDataValid = UserPrivateUpdateSchema.validate(newUserData);

      if (newUserDataValid.error) {
        return res.status(422).send(`Validation error: ${newUserDataValid.error.details[0].message}`);
      }

      if (newUserData.password) {
        newUserData.password = await this.cryptoProvider.hashStringBySHA256(newUserData.password);
      }

      const updatedUser = await this.userService.updateUserById(userId, newUserData);
      return res.status(200).json({ status: 200, data: updatedUser, message: "User successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.session.user as User;
      const newUserData = req.body;
      const { error } = UserPublicUpdateSchema.validate(newUserData);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      let newEmail = null;
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
        newUserData.password = await this.cryptoProvider.hashStringBySHA256(newUserData.newPassword);
        delete newUserData.newPassword;
        delete newUserData.oldPassword;
      }

      if (newUserData.email && newUserData.email !== user.email) {
        const verifToken = this.cryptoProvider.generateSecureVerificationToken();
        const verifLink = process.env.CUR_URL + `/api/users/verifyUserEmail?token=${verifToken}`;

        await this.mailerTransporter.sendMailByTransporter({
          to: newUserData.email,
          subject: 'Verify your email',
          html: `<p>Hello, it's <strong>Daccord Service!</strong> You are trying to change your email.</p><br>
          <p>Please confirm your new email by clicking on the link: <strong><a style="text-decoration: underline;" href="${verifLink}">Change your email</a></strong></p>`
        });

        await this.userContactService.createUserContactByUserId(user.id, {
          type: 'newEmail',
          value: newUserData.email
        });

        newEmail = newUserData.email;
        delete newUserData.email;
        newUserData.verifToken = verifToken;
      }

      const updatedUser = await this.userService.updateUser(user, newUserData);

      return newEmail ?
        res.status(200).json({
          status: 200,
          data: updatedUser,
          verifEmail: true,
          message: `User successfully updated and email successfully sent to ${newEmail}`
        }) :
        res.status(200).json({
          status: 200,
          data: updatedUser,
          verifEmail: false,
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

      await this.userService.deleteUserById(userId);
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
      const user = await this.userService.getUserByVerifToken(token as string);
      const userContacts = await this.userContactService.getAllUserContactsByUserId(user.id, 'newEmail');
      const newUserEmail = userContacts[0].value;

      await this.userService.updateUserAuthData(user, {
        email: newUserEmail,
        verifToken: null
      });

      await this.userContactService.deleteUserContact(userContacts[0]);
      return res.redirect(process.env.CUR_URL + '/api');
    }
    catch (err) {
      next(err);
    }
  }
}
export default UserController;
