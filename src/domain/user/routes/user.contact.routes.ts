import express, { Router } from 'express';
import dependencyContainer from '../../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../../app.routes.abstract';
import UserContactController from '../controller/user.contact.controller';
import authGuard from '../../auth/middleware/guard/auth.guard';

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
    this.userContactRouter.use('/public', authGuard);
    this.userContactRouter.post('/public', (...args) => this.userContactController.createUserContact(...args));
    this.userContactRouter.get(
      '/public', (...args) => this.userContactController.getAllUserContacts(...args)
    );
    this.userContactRouter.get(
      '/public/:userContactId', (...args) => this.userContactController.getUserContactById(...args)
    );
    this.userContactRouter.patch(
      '/public/:userContactId', (...args) => this.userContactController.updateUserContactById(...args)
    );
    this.userContactRouter.delete(
      '/public/:userContactId', (...args) => this.userContactController.deleteUserContactById(...args)
    );
  }
}
export default UserContactRouter;
