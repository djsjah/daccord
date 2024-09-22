import { Request, Response, NextFunction } from 'express';
import { PostFiltersSchema } from './validation/schema/post.search.schema';
import { IPostFilters } from './validation/interface/post.filters.interface';
import { IdSchemaRequired, IdSchemaOptional } from '../validation/joi/schema/joi.params.schema';
import PostService from './service/post.service';
import PostFilter from './service/post.filter';
import PostRevision from './service/post.revision';
import JoiRequestValidation from '../validation/joi/decorator/joi.validation.decorator';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import PostUpdateSchema from './validation/schema/post.update.schema';

class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postFilter: PostFilter,
    private readonly postRevision: PostRevision
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
        posts = await this.postService.getAllUserPosts({
          where: {
            isMainRevision: true
          }
        }, user);
      }
      else {
        posts = await this.postFilter.searchByFilter(user, filters);
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
  }, IdSchemaRequired)
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
    type: 'params',
    name: 'postId'
  }, IdSchemaOptional)
  @JoiRequestValidation({
    type: 'body'
  }, PostUpdateSchema)
  public async createUserPost(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      let mainRevision = req.params.postId ?
        await this.postService.getPostByUniqueParams({
          where: {
            id: req.params.postId,
            isMainRevision: true,
            authorId: user.id
          }
        }) : undefined;

      mainRevision = mainRevision ? await this.postRevision.makeRevisionNonMain(mainRevision) : mainRevision;
      const newPost = await this.postService.createUserPost(user.role, {
        ...req.body,
        authorId: user.id
      }, mainRevision);

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
  }, IdSchemaRequired)
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

      switch (req.body.isMainRevision) {
        case true:
          if (post.isMainRevision) {
            return res.status(422).send(`Validation error: post with id - ${post.id} is main revision`);
          }

          const mainRevision = await this.postService.getPostByUniqueParams({
            where: {
              isMainRevision: true,
              revisionGroupId: post.revisionGroupId
            }
          });

          await this.postRevision.makeRevisionNonMain(mainRevision);
          break;

        case false:
          if (!post.isMainRevision || !post.revisionGroupId) {
            return res.status(422).send(
              `Validation error: post with id - ${post.id} is not main revision or only one revision`
            );
          }

          await this.postRevision.setMainRevision(post.revisionGroupId);
          break;
      }

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
  }, IdSchemaRequired)
  public async deleteUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const post = await this.postService.getPostByUniqueParams({
        where: {
          id: req.params.postId
        }
      }, user);

      if (post.isMainRevision && post.revisionGroupId) {
        await this.postRevision.setMainRevision(post.revisionGroupId);
      }

      await this.postService.deleteUserPost(post);
      return res.status(200).json({ status: 200, message: "Post successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
