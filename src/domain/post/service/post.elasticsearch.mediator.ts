import {
  IPostSearchSettings,
  IPostSearch,
  IPostSearchRestrict
} from '../validation/interface/post.search.interface';
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
    params: Object.values(PostSearchParam),
    methods: Object.values(ElasticSearchMethod)
  };

  private readonly searchOptions: IPostSearch = {
    index: 'post_idx',
    slop: 1
  };

  private readonly searchOptionsRestrict: IPostSearchRestrict = {
    admin: () => {
      return;
    },
    user: (userId: string) => {
      return {
        excludes: [
          'authorId'
        ],
        term: {
          authorId: userId
        }
      };
    }
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
  ): Promise<IPostIndex[] | Omit<IPostIndex, keyof Array<keyof IPostIndex>>[]> {
    return (
      await this.esService.search({
        ...this.searchOptions,
        ...this.searchOptionsRestrict[user.role](user.id),
        param: searchParam,
        method: searchMethod,
        request: searchRequest
      }) as IPostIndex[]
    );
  }

  public async addDocumentToIndex(postIndexData: IPostIndex): Promise<void> {
    await this.esProvider.indexDocument(this.searchOptions.index, postIndexData.id, postIndexData);
  }

  public async updateDocumentInIndex(post: Post, newPostData: IPostUpdate): Promise<void> {
    const postChanges: Partial<IPostIndex> = {};

    this.searchSettings.params.forEach(key => {
      if (key in newPostData && newPostData[key] !== post[key]) {
        postChanges[key] = newPostData[key];
      }
    });

    if (Object.keys(postChanges).length > 0) {
      await this.esProvider.updateDocument(this.searchOptions.index, post.id, postChanges);
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
