import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import authGuard from '../auth/guard/auth.guard';
import authAdminGuard from '../auth/guard/auth.admin.guard';
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
    this.postRouter.get('/public', (...args) => this.postController.getAllUserPostsByUserId(...args));
    this.postRouter.post('/public', (...args) => this.postController.createPost(...args));
    this.postRouter.get('/public/:postTitle', (...args) => this.postController.getUserPostByTitle(...args));
    this.postRouter.patch('/public/:postTitle', (...args) => this.postController.updateUserPostByTitle(...args));
    this.postRouter.delete('/public/:postTitle', (...args) => this.postController.deleteUserPostByTitle(...args));

    this.postRouter.use('/admin', authAdminGuard);
    this.postRouter.get('/admin', (...args) => this.postController.getAllUsersPosts(...args));
    this.postRouter.get('/admin/:postId', (...args) => this.postController.getPostById(...args));
    this.postRouter.patch('/admin/:postId', (...args) => this.postController.updatePostById(...args));
    this.postRouter.delete('/admin/:postId', (...args) => this.postController.deletePostById(...args));
  }
}
export default PostRouter;
