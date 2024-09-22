import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import User from '../../../database/sequelize/models/user/user.model';
import DomainController from '../../domain.controller.abstract';
import UserService from '../service/user.service';
import UserContactService from '../service/user.contact.service';
import MailerTransporter from '../../../utils/lib/mailer/mailer.transporter';
import JWTStrategy from '../../../utils/lib/jwt/jwt.strategy';
import CryptoProvider from '../../../utils/lib/crypto/crypto.provider';
import JoiRequestValidation from '../../validation/joi/decorator/joi.validation.decorator';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IUserSystemUpdate from '../validation/interface/user.system.update.interface';
import UserRole from '../validation/enum/user.role.enum';
import UserUpdateSchema from '../validation/schema/user.update.schema';

class UserUpdateController extends DomainController {
  constructor(
    private readonly userService: UserService,
    private readonly userContactService: UserContactService,
    private readonly mailerTransporter: MailerTransporter,
    private readonly cryptoProvider: CryptoProvider,
    private readonly jwtStrategy: JWTStrategy
  ) {
    super();
  }

  @JoiRequestValidation({
    type: 'body'
  }, UserUpdateSchema)
  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      let newUserData = req.body;
      const userPayload = req.user as IUserPayload;
      const user = await this.userService.getUserByUniqueParams({
        where: {
          id: userPayload.id
        }
      });

      newUserData = await this.updateUserPassword(req, res, user);
      newUserData = await this.updateUserEmail(req, userPayload);
      newUserData = await this.isUpdateUserJWTTokens(req, res, userPayload);

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

  public override async verifyUserEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const { token } = req.query;
      const user = await this.userService.getUserByUniqueParams({
        where: {
          verifToken: token
        }
      });

      const userContacts = await this.userContactService.getAllUserContacts(
        {
          where: {
            [Op.or]: [
              { type: { [Op.like]: `%newEmail%` } }
            ]
          }
        },
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole
        }
      );

      const newUserEmail = userContacts[0].value;
      const newUserData = await this.updateUserJWTTokens(req, res, {
        id: user.id,
        name: user.name,
        email: newUserEmail,
        role: user.role as UserRole
      });

      newUserData.verifToken = null;
      newUserData.email = newUserEmail;

      await this.userService.updateUser(user, newUserData);
      await this.userContactService.deleteUserContact(userContacts[0]);

      return res.redirect(process.env.CUR_URL + '/api');
    }
    catch (err) {
      next(err);
    }
  }

  public async updateUserPassword(
    req: Request,
    res: Response,
    user: User
  ): Promise<Response | IUserSystemUpdate> {
    const newUserData = req.body;
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

    return newUserData;
  }

  public async updateUserEmail(req: Request, userPayload: IUserPayload): Promise<IUserSystemUpdate> {
    const newUserData = req.body;

    if (userPayload.role !== 'admin' && newUserData.email && newUserData.email !== userPayload.email) {
      const verifToken = this.cryptoProvider.generateSecureVerificationToken();
      const verifLink = process.env.CUR_URL + `/api/users/verifyUserEmail?token=${verifToken}`;

      await this.mailerTransporter.sendMailByTransporter({
        to: newUserData.email,
        subject: 'Verify your email',
        html: `<p>Hello, it's <strong>Daccord Service!</strong> You are trying to change your email.</p><br>
        <p>Please confirm your new email by clicking on the link: <strong><a style="text-decoration: underline;" href="${verifLink}">Change your email</a></strong></p>`
      });

      const userNewEmails = await this.userContactService.getAllUserContacts({
        where: {
          [Op.or]: [
            { type: { [Op.like]: `%newEmail%` } }
          ]
        }
      }, userPayload);

      if (userNewEmails.length > 0) {
        await this.userContactService.deleteUserContact(userNewEmails[0]);
      }

      await this.userContactService.createUserContact(userPayload, {
        type: 'newEmail',
        value: newUserData.email
      });

      newUserData.verifToken = verifToken;
      delete newUserData.email;
    }

    return newUserData;
  }

  public async isUpdateUserJWTTokens(
    req: Request,
    res: Response,
    userPayload: IUserPayload
  ): Promise<IUserSystemUpdate> {
    const newUserData = req.body;
    const updatedUserPayload: IUserPayload = {
      id: userPayload.id,
      name: userPayload.name,
      email: userPayload.email,
      role: userPayload.role as UserRole
    };

    let isUpdateUserJWTTokens = false;

    if (userPayload.role === 'admin' && newUserData.email && userPayload.email !== newUserData.email) {
      updatedUserPayload.email = newUserData.email;
      isUpdateUserJWTTokens = true;
    }

    if (newUserData.name && newUserData.name !== userPayload.name) {
      updatedUserPayload.name = newUserData.name;
      isUpdateUserJWTTokens = true;
    }

    if (isUpdateUserJWTTokens) {
      return (
        await this.updateUserJWTTokens(req, res, updatedUserPayload)
      );
    }

    return newUserData;
  }

  public async updateUserJWTTokens(
    req: Request,
    res: Response,
    updatedUserPayload: IUserPayload
  ): Promise<IUserSystemUpdate> {
    const newUserData = req.body;
    const accessToken = await this.jwtStrategy.createJWTToken(updatedUserPayload);
    const refreshToken = await this.jwtStrategy.createJWTToken(updatedUserPayload, false);

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

    newUserData.refreshToken = refreshToken;
    return newUserData;
  }
}
export default UserUpdateController;
