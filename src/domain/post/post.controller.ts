import { Request, Response, NextFunction } from 'express';
import { PostFiltersSchema } from './validation/schema/post.search.schema';
import {
  IPostFiltersSettings,
  IPostFilters,
  IPostSearchFilter
} from './validation/interface/post.filters.interface';
import PostService from './service/post.service';
import PostElasticSearchMediator from './service/post.elasticsearch.mediator';
import JoiRequestValidation from '../validation/joi/decorator/joi.validation.decorator';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import ElasticSearchMethod from '../../utils/lib/elasticsearch/validation/enum/elasticsearch.method';
import PostSearchParam from './validation/enum/post.search.param';
import IdSchema from '../validation/joi/schema/joi.params.schema';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';

class PostController {
  private readonly postFiltersSettings: IPostFiltersSettings;

  constructor(
    private readonly postService: PostService,
    private readonly postESMediator: PostElasticSearchMediator
  ) {
    this.postFiltersSettings = {
      search: this.postESMediator.getSearchSettings()
    };
  }

  @JoiRequestValidation({
    type: 'query',
    name: 'filters'
  }, PostFiltersSchema)
  public async getAllUserPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const filters = req.query.filters as IPostFilters;
      let posts = [];

      if (!filters) {
        posts = await this.postService.getAllUserPosts({}, user);
      }
      else {
        const searchParam = this.postFiltersSettings.search.params.find(
          param => param in filters
        ) as PostSearchParam;

        const searchParamBody = filters[searchParam] as IPostSearchFilter;
        const searchMethod = this.postFiltersSettings.search.methods.find(
          param => param in searchParamBody
        ) as ElasticSearchMethod;

        const searchRequest = searchParamBody[searchMethod] as string;
        posts = await this.postESMediator.callElasticSearch(user, searchParam, searchMethod, searchRequest);
      }

      return res.status(200).json({ status: 200, data: posts, message: "List of all posts" });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'postId'
  }, IdSchema)
  public async getUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const post = await this.postService.getPostByUniqueParams({
        where: {
          id: req.params.postId
        }
      }, user);

      return res.status(200).json({
        status: 200,
        data: post,
        message: `Post details with id: ${post.id}`
      });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'body'
  }, PostCreateSchema)
  public async createUserPost(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const newPost = await this.postService.createUserPost(user, {
        ...req.body,
        authorId: user.id
      });

      return res.status(201).location(`/api/posts/${newPost.id}`).json({
        status: 201,
        data: newPost,
        message: "Post successfully created"
      });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'postId'
  }, IdSchema)
  @JoiRequestValidation({
    type: 'body'
  }, PostUpdateSchema)
  public async updateUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const post = await this.postService.getPostByUniqueParams({
        where: {
          id: req.params.postId
        }
      }, user);

      const updatedPost = await this.postService.updateUserPost(post, req.body);
      return res.status(200).json({ status: 200, data: updatedPost, message: "Post successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  @JoiRequestValidation({
    type: 'params',
    name: 'postId'
  }, IdSchema)
  public async deleteUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const post = await this.postService.getPostByUniqueParams({
        where: {
          id: req.params.postId
        }
      }, user);

      await this.postService.deleteUserPost(post);
      return res.status(200).json({ status: 200, message: "Post successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
