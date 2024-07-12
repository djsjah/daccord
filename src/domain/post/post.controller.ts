import { NextFunction, Request, Response } from 'express';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import PostService from './post.service';
import PostGetByIdSchema from './validation/schema/post.get.schema';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';

class PostController {
  constructor(private readonly postService: PostService) { }

  public async getAllUserPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = req.user as IUserPayload;
      const searchSubstring = req.query.search as string;
      const posts = await this.postService.getAllUserPosts(user, searchSubstring);

      return res.status(200).json({status: 200, data: posts, message: "List of all posts" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const { error } = PostGetByIdSchema.validate(postId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const post = await this.postService.getUserPostById(user, postId);

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

  public async createUserPost(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postDataCreate = req.body;
      const { error } = PostCreateSchema.validate(postDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const newPost = await this.postService.createUserPost(user, {
        ...postDataCreate,
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

  public async updateUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const postIdValid = PostGetByIdSchema.validate(postId);

      if (postIdValid.error) {
        return res.status(422).send(`Validation error: ${postIdValid.error.details[0].message}`);
      }

      const newPostData = req.body;
      const newPostDataValid = PostUpdateSchema.validate(newPostData);

      if (newPostDataValid.error) {
        return res.status(422).send(`Validation error: ${newPostDataValid.error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      const updatedPost = await this.postService.updateUserPostById(user, postId, newPostData);

      return res.status(200).json({ status: 200, data: updatedPost, message: "Post successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deleteUserPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const { error } = PostGetByIdSchema.validate(postId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.user as IUserPayload;
      await this.postService.deleteUserPostById(user, postId);

      return res.status(200).json({ status: 200, message: "Post successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
