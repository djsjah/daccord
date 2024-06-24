import { NextFunction, Request, Response } from 'express';
import PostService from './post.service';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';
import PostGetSchema from './validation/schema/post.get.schema';

class PostController {
  constructor(private readonly postService: PostService) { }

  public async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const posts = await this.postService.getAllPosts(searchSubstring as string);
      return res.status(200).json({ status: 200, data: posts, message: "List of all posts" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getPostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const { error } = PostGetSchema.validate(postId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const post = await this.postService.getPostById(postId);
      return res.status(200).json({ status: 200, data: post, message: "Post details" });
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

      const newPost = await this.postService.createPost(postDataCreate);

      return res.status(201).location(`/api/posts/${newPost.id}`).json(
        { status: 201, data: newPost, message: "Post successfully created" }
      );
    }
    catch (err) {
      next(err);
    }
  }

  public async updatePostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const postIdValid = PostGetSchema.validate(postId);

      if (postIdValid.error) {
        return res.status(422).send(`Validation error: ${postIdValid.error.details[0].message}`);
      }

      const newPostData = req.body;
      const newPostDataValid = PostUpdateSchema.validate(newPostData);

      if (newPostDataValid.error) {
        return res.status(422).send(`Validation error: ${newPostDataValid.error.details[0].message}`);
      }

      const updatedPost = await this.postService.updatePostById(postId, newPostData);
      return res.status(200).json({ status: 200, data: updatedPost, message: "Post successfully updated" });
    }
    catch (err) {
      next(err);
    }
  }

  public async deletePostById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postId = req.params.postId;
      const { error } = PostGetSchema.validate(postId);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      await this.postService.deletePostById(postId);
      return res.status(200).json({ status: 200, message: "Post successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
