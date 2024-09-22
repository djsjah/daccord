import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import PostRouter from './post.routes';
import PostController from './post.controller';
import PostService from './service/post.service';
import PostRevision from './service/post.revision';
import PostFilter from './service/post.filter';
import PostElasticSearchMediator from './service/post.elasticsearch.mediator';
import ElasticSearchProvider from '../../utils/lib/elasticsearch/elasticsearch.provider';
import ElasticSearchService from '../../utils/lib/elasticsearch/elasticsearch.service';

class PostModule {
  private readonly postController: PostController;
  private readonly postService: PostService;
  private readonly postESMediator: PostElasticSearchMediator;
  private readonly postRevision: PostRevision;
  private readonly postFilter: PostFilter;

  constructor() {
    this.postESMediator = new PostElasticSearchMediator(
      dependencyContainer.getInstance<ElasticSearchService>('esService'),
      dependencyContainer.getInstance<ElasticSearchProvider>('esProvider')
    );

    this.postService = new PostService(this.postESMediator);
    this.postRevision = new PostRevision(this.postService);

    this.postFilter = new PostFilter(
      this.postService,
      this.postESMediator
    );
    this.postController = new PostController(
      this.postService,
      this.postFilter,
      this.postRevision
    );

    dependencyContainer.registerInstance('postESMediator', this.postESMediator);
    dependencyContainer.registerInstance('postService', this.postService);
    dependencyContainer.registerInstance('postRevision', this.postRevision);
    dependencyContainer.registerInstance('postFilter', this.postFilter);
    dependencyContainer.registerInstance('postController', this.postController);
    dependencyContainer.registerInstance('postRouter', new PostRouter());
  }
}
export default PostModule;
