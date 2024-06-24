import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import PostRouter from './post.routes';
import PostController from './post.controller';
import PostService from './post.service';
import UserService from '../user/service/user.service';
import NotificationGateway from '../../utils/lib/notification/notification.gateway';

class PostModule {
  private readonly postController: PostController;
  private readonly postService: PostService;

  constructor() {
    this.postService = new PostService(
      dependencyContainer.getInstance<UserService>('userService'),
      dependencyContainer.getInstance<NotificationGateway>('notifGateway')
    );

    this.postController = new PostController(this.postService);

    dependencyContainer.registerInstance('postService', this.postService);
    dependencyContainer.registerInstance('postController', this.postController);
    dependencyContainer.registerInstance('postRouter', new PostRouter());
  }
}
export default PostModule;
