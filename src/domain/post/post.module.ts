import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import PostRouter from './post.routes';
import PostController from './post.controller';
import PostService from './service/post.service';
import PostElasticSearchMediator from './service/post.elasticsearch.mediator';
import ElasticSearchProvider from '../../utils/lib/elasticsearch/elasticsearch.provider';
import ElasticSearchService from '../../utils/lib/elasticsearch/elasticsearch.service';

class PostModule {
  private readonly postController: PostController;
  private readonly postService: PostService;
  private readonly postESMediator: PostElasticSearchMediator;

  constructor() {
    this.postESMediator = new PostElasticSearchMediator(
      dependencyContainer.getInstance<ElasticSearchService>('esService'),
      dependencyContainer.getInstance<ElasticSearchProvider>('esProvider')
    );

    this.postService = new PostService(
      this.postESMediator
    );
    this.postController = new PostController(
      this.postService,
      this.postESMediator
    );

    dependencyContainer.registerInstance('postESMediator', this.postESMediator);
    dependencyContainer.registerInstance('postService', this.postService);
    dependencyContainer.registerInstance('postController', this.postController);
    dependencyContainer.registerInstance('postRouter', new PostRouter());
  }
}
export default PostModule;
