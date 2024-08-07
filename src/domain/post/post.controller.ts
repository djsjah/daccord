import { Request, Response, NextFunction } from 'express';
import { PostFiltersSchema, PostSearchSchema } from './validation/schema/post.search.schema';
import {
  IPostFilters,
  IPostFiltersSettings,
  ISearchType,
  ISearchMethod
} from './validation/interface/post.filters.interface';
import PostService from './post.service';
import JoiRequestValidation from '../validation/joi/decorator/joi.validation.decorator';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import IdSchema from '../validation/joi/schema/joi.params.schema';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';
import joiValidation from '../validation/joi/joi.validation';

class PostController {
  private readonly postFiltersSettings: IPostFiltersSettings = {
    search: {
      params: ['title', 'content'],
      methods: [
        {
          name: 'wordSearch',
          method: (
            user: IUserPayload,
            searchParam: 'title' | 'content',
            searchString: string
          ) => this.postService.wordSearch(user, searchParam, searchString)
        },
        {
          name: 'phraseSearch',
          method: (
            user: IUserPayload,
            searchParam: 'title' | 'content',
            searchString: string
          ) => this.postService.phraseSearch(user, searchParam, searchString)
        }
      ]
    }
  };

  constructor(
    private readonly postService: PostService
  ) { }

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
        ) as ('title' | 'content');

        const searchParamBody: ISearchType = JSON.parse(filters[searchParam] as string);
        const validError = joiValidation(searchParamBody, PostSearchSchema);

        if (validError) {
          return res.status(422).send(validError);
        }

        const searchMethod = this.postFiltersSettings.search.methods.find(
          param => param.name in searchParamBody
        ) as ISearchMethod;

        const searchString = searchParamBody[searchMethod.name] as string;
        posts = await searchMethod.method(user, searchParam, searchString);
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
