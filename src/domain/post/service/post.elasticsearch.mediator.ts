import { IPostSearchSettings, IPostSearch } from '../validation/interface/post.search.interface';
import Post from '../../../database/sequelize/models/post/post.model';
import ElasticSearchProvider from '../../../utils/lib/elasticsearch/elasticsearch.provider';
import ElasticSearchService from '../../../utils/lib/elasticsearch/elasticsearch.service';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IPostIndex from '../validation/interface/post.index.interface';
import IPostUpdate from '../validation/interface/post.update.interface';
import PostSearchParam from '../validation/enum/post.search.param';
import ElasticSearchMethod from '../../../utils/lib/elasticsearch/validation/enum/elasticsearch.method';

class PostElasticSearchMediator {
  private readonly searchSettings: IPostSearchSettings = {
    params: [PostSearchParam.title, PostSearchParam.content],
    methods: [ElasticSearchMethod.wordSearch, ElasticSearchMethod.phraseSearch]
  };

  private readonly searchOptions: IPostSearch = {
    index: 'post_idx',
    slop: 1,
    exceptions: [
      'authorId'
    ]
  };

  constructor(
    private readonly esService: ElasticSearchService,
    private readonly esProvider: ElasticSearchProvider
  ) { }

  public async callElasticSearch(
    user: IUserPayload,
    searchParam: PostSearchParam,
    searchMethod: ElasticSearchMethod,
    searchRequest: string
  ): Promise<unknown[]> {
    return (
      await this.esService.search({
        ...this.searchOptions,
        user: user,
        param: searchParam,
        method: searchMethod,
        request: searchRequest
      })
    );
  }

  public async addDocumentToIndex(postIndexData: IPostIndex): Promise<void> {
    await this.esProvider.indexDocument(this.searchOptions.index, postIndexData.id, {
      id: postIndexData.id,
      title: postIndexData.title,
      content: postIndexData.content,
      authorId: postIndexData.authorId
    });
  }

  public async updateDocumentInIndex(post: Post, newPostData: IPostUpdate): Promise<void> {
    if (newPostData.title && post.title !== newPostData.title) {
      await this.esProvider.updateDocument(this.searchOptions.index, post.id, {
        title: newPostData.title
      });
    }

    if (newPostData.content && post.content !== newPostData.content) {
      await this.esProvider.updateDocument(this.searchOptions.index, post.id, {
        content: newPostData.content
      });
    }
  }

  public async deleteDocumentFromIndex(postId: string): Promise<void> {
    await this.esProvider.deleteDocument(this.searchOptions.index, postId);
  }

  public getSearchSettings(): IPostSearchSettings {
    return this.searchSettings;
  }
}
export default PostElasticSearchMediator;
