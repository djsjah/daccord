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
    this.postRouter.use(authGuard);
    this.postRouter.get('/', (...args) => this.postController.getAllUserPosts(...args));
    this.postRouter.get('/:postTitle', (...args) => this.postController.getPostByTitle(...args));
    this.postRouter.post('/', (...args) => this.postController.createPost(...args));
    this.postRouter.put('/:postTitle', (...args) => this.postController.updatePostByTitle(...args));
    this.postRouter.patch('/:postTitle', (...args) => this.postController.updatePostByTitle(...args));
    this.postRouter.delete('/:postTitle', (...args) => this.postController.deletePostByTitle(...args));
  }
}
export default PostRouter;
