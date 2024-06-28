import express, { Router } from 'express';
import dependencyContainer from '../../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../../app.routes.abstract';
import UserContactController from '../controller/user.contact.controller';
import authAdminGuard from '../../auth/guard/auth.admin.guard';

class UserContactRouter extends AbstractRouter {
  private readonly userContactRouter: Router;
  private readonly userContactController: UserContactController;

  constructor() {
    super();
    this.userContactRouter = express.Router();
    this.userContactController = dependencyContainer.getInstance<UserContactController>('userContactController');
    this.setupRouter();
  }

  public override getRouter(): Router {
    return this.userContactRouter;
  }

  protected override setupRouter(): void {
    this.userContactRouter.use(authAdminGuard);
    this.userContactRouter.get('/', (...args) => this.userContactController.getAllUsersContacts(...args));

    this.userContactRouter.get(
      '/:userId', (...args) => this.userContactController.getAllUserContactsByUserId(...args)
    );

    this.userContactRouter.get(
      '/:userContactId', (...args) => this.userContactController.getUserContactById(...args)
    );

    this.userContactRouter.put(
      '/:userContactId', (...args) => this.userContactController.updateUserContactById(...args)
    );

    this.userContactRouter.patch(
      '/:userContactId', (...args) => this.userContactController.updateUserContactById(...args)
    );

    this.userContactRouter.delete(
      '/:userContactId', (...args) => this.userContactController.deleteUserContactById(...args)
    );
  }
}
export default UserContactRouter;
