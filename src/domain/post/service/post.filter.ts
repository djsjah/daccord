import {
  IPostESFilter,
  IPostFilters,
  IPostFiltersSettings
} from '../validation/interface/post.filters.interface';
import PostService from './post.service';
import PostElasticSearchMediator from './post.elasticsearch.mediator';
import Post from '../../../database/sequelize/models/post/post.model';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IPostIndex from '../validation/interface/post.index.interface';
import PostSearchParam from '../validation/enum/post.search.param.enum';
import PostESParam from '../validation/enum/post.elasticsearch.param.enum';
import ElasticSearchMethod from '../../../utils/lib/elasticsearch/validation/enum/elasticsearch.method.enum';

class PostFilter {
  private readonly postFiltersSettings: IPostFiltersSettings = {
    search: {
      params: Object.values(PostSearchParam)
    }
  };

  constructor(
    private readonly postService: PostService,
    private readonly postESMediator: PostElasticSearchMediator
  ) { }

  public async searchByFilter(
    user: IUserPayload,
    filters: IPostFilters
  ): Promise<Post[] | IPostIndex[] | Omit<IPostIndex, keyof Array<keyof IPostIndex>>[]> {
    const searchParam = this.postFiltersSettings.search.params.find(
      param => param in filters
    ) as PostSearchParam;

    let posts = null;

    switch (searchParam) {
      case PostSearchParam.title:
      case PostSearchParam.content:
        posts = await this.elasticSearchPosts(user, filters, searchParam);
        break;

      case PostSearchParam.revisionGroupId:
        posts = await this.searchRevisionGroup(user, filters, searchParam);
        break;
    }

    return posts;
  }

  private async searchRevisionGroup(
    user: IUserPayload,
    filters: IPostFilters,
    searchParam: PostSearchParam
  ): Promise<Post[]> {
    return (
      await this.postService.getAllUserPosts({
        where: {
          revisionGroupId: filters[searchParam] as string
        }
      }, user)
    );
  }

  private async elasticSearchPosts(
    user: IUserPayload,
    filters: IPostFilters,
    searchParam: PostSearchParam
  ): Promise<IPostIndex[] | Omit<IPostIndex, keyof Array<keyof IPostIndex>>[]> {
    const searchParamBody = filters[searchParam] as IPostESFilter;
    const searchMethod = this.postESMediator.getSearchSettings().methods.find(
      param => param in searchParamBody
    ) as ElasticSearchMethod;

    const searchRequest = searchParamBody[searchMethod] as string;
    return (
      await this.postESMediator.callElasticSearch(
        user,
        searchParam as unknown as PostESParam,
        searchMethod,
        searchRequest
      )
    );
  }
}
export default PostFilter;
