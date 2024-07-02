import { NextFunction, Request, Response } from 'express';
import User from '../../database/models/user/user.model';
import PostService from './post.service';
import PostGetByIdSchema from './validation/schema/post.get.schema';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';

class PostController {
  constructor(private readonly postService: PostService) { }

  public async getAllUsersPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const posts = await this.postService.getAllUsersPosts(searchSubstring as string);
      return res.status(200).json({ status: 200, data: posts, message: "List of all posts of all users" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getAllUserPostsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const user = req.session.user as User;
      const posts = await this.postService.getAllUserPostsByUserId(user, searchSubstring as string);

      return res.status(200).json({status: 200, data: posts, message: "List of all your posts" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const { error } = PostGetByIdSchema.validate(postId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.session.user as User;
      const post = await this.postService.getPostById(user, postId);

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

  public async createPost(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postDataCreate = req.body;
      const { error } = PostCreateSchema.validate(postDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.session.user as User;
      const newPost = await this.postService.createPost(user, {
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

  public async updatePostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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

      const user = req.session.user as User;
      const updatedPost = await this.postService.updatePostById(user, postId, newPostData);

      return res.status(200).json({ status: 200, data: updatedPost, message: "Post successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deletePostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const { error } = PostGetByIdSchema.validate(postId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const user = req.session.user as User;
      await this.postService.deletePostById(user, postId);

      return res.status(200).json({ status: 200, message: "Post successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
