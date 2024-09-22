import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import authGuard from '../auth/middleware/guard/auth.guard';
import PostController from './post.controller';

class PostRouter extends AbstractRouter {
  private readonly postRouter: Router;
  private readonly postController: PostController;

  constructor() {
    super();
    this.postRouter = express.Router();
    this.postController = dependencyContainer.getInstance<PostController>('postController');
    this.setupRouter();
  }

  public override getRouter(): Router {
    return this.postRouter;
  }

  protected override setupRouter(): void {
    this.postRouter.use('/public', authGuard);
    this.postRouter.get('/public', (...args) => this.postController.getAllUserPosts(...args));
    this.postRouter.post('/public/:postId?', (...args) => this.postController.createUserPost(...args));
    this.postRouter.get('/public/:postId', (...args) => this.postController.getUserPostById(...args));
    this.postRouter.patch('/public/:postId', (...args) => this.postController.updateUserPostById(...args));
    this.postRouter.delete('/public/:postId', (...args) => this.postController.deleteUserPostById(...args));
  }
}
export default PostRouter;
