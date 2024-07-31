import { Request, Response, NextFunction } from 'express';
import PostService from './post.service';
import ValidateReqParam from '../validation/decorator/req.param.decorator';
import ValidateReqBody from '../validation/decorator/req.body.decorator';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import IdSchema from '../validation/schema/param.schema';
import PostSearchParamSchema from './validation/schema/post.search.schema';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';

class PostController {
  constructor(
    private readonly postService: PostService
  ) { }

  @ValidateReqParam('searchParam', PostSearchParamSchema)
  public async getAllUserPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const searchParam = (req.query.searchParam as 'title' | 'content') || 'title';
      const searchString = req.query.searchString as string;

      let posts = [];

      if (!searchString) {
        posts = await this.postService.getAllUserPosts({}, user);
      }
      else {
        posts = await this.postService.phraseSearch(user, searchParam, searchString);
      }

      return res.status(200).json({ status: 200, data: posts, message: "List of all posts" });
    }
    catch (err) {
      next(err);
    }
  }

  @ValidateReqParam('postId', IdSchema)
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

  @ValidateReqBody(PostCreateSchema)
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

  @ValidateReqParam('postId', IdSchema)
  @ValidateReqBody(PostUpdateSchema)
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

  @ValidateReqParam('postId', IdSchema)
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
