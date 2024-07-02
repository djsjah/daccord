import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import PostRouter from './post.routes';
import PostController from './post.controller';
import PostService from './post.service';

class PostModule {
  private readonly postController: PostController;
  private readonly postService: PostService;

  constructor() {
    this.postService = new PostService();
    this.postController = new PostController(this.postService);

    dependencyContainer.registerInstance('postService', this.postService);
    dependencyContainer.registerInstance('postController', this.postController);
    dependencyContainer.registerInstance('postRouter', new PostRouter());
  }
}
export default PostModule;
