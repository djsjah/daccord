import express, { Router } from 'express';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import AbstractRouter from '../../app.routes.abstract';
import authGuard from '../auth/auth.guard';
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
    this.postRouter.get('/', (...args) => this.postController.getAllPosts(...args));
    this.postRouter.use(authGuard);
    this.postRouter.get('/:postId', (...args) => this.postController.getPostById(...args));
    this.postRouter.post('/', (...args) => this.postController.createPost(...args));
    this.postRouter.put('/:postId', (...args) => this.postController.updatePostById(...args));
    this.postRouter.patch('/:postId', (...args) => this.postController.updatePostById(...args));
    this.postRouter.delete('/:postId', (...args) => this.postController.deletePostById(...args));
  }
}
export default PostRouter;
