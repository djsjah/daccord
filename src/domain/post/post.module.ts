import dependencyContainer from '../../dependencyInjection/dependency.container';
import PostRouter from './post.routes';
import PostController from './post.controller';
import PostService from './post.service';
import UserService from '../user/user.service';

class PostModule {
  private readonly postController: PostController;
  private readonly postService: PostService;

  constructor() {
    this.postService = new PostService(dependencyContainer.getInstance<UserService>('userService'));
    this.postController = new PostController(this.postService);
    dependencyContainer.registerInstance('postService', this.postService);
    dependencyContainer.registerInstance('postController', this.postController);
    dependencyContainer.registerInstance('postRouter', new PostRouter());
  }
}
export default PostModule;
