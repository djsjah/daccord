import express, { Router } from 'express';
import dependencyContainer from '../../dependencyInjection/dependency.container';
import PostController from './post.controller';

class PostRouter {
  private readonly postRouter: Router;
  private readonly postController: PostController;

  constructor() {
    this.postRouter = express.Router();
    this.postController = dependencyContainer.getInstance<PostController>('postController');
    this.setupPostRouter();
  }

  public getPostRouter(): Router {
    return this.postRouter;
  }

  private setupPostRouter(): void {
    this.postRouter.get('/', (...args) => this.postController.getAllPosts(...args));
    this.postRouter.get('/:id', (...args) => this.postController.getPostById(...args));
    this.postRouter.post('/', (...args) => this.postController.createPost(...args));
  }
}
export default PostRouter;
