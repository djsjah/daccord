import { NextFunction, Request, Response } from 'express';
import PostService from './post.service';
import PostSchema from './validation/schema/post.schema';

class PostController {
  constructor(private readonly postService: PostService) { }

  public async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const searchSubstring = req.query.search || '';
      const posts = await this.postService.getAllPosts(searchSubstring as string);

      if (!res.headersSent) {
        return res.status(200).json({ status: 200, data: posts, message: "List of all posts" });
      }
    }
    catch (err) {
      next(err);
    }
  }

  public async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const post = await this.postService.getPostById(id);

      if (post) {
        return res.status(200).json({ status: 200, data: post, message: "Post details" });
      }
    }
    catch (err) {
      next(err);
    }
  }

  public async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const postData = req.body;
      const { error } = PostSchema.validate(postData);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const newPost = await this.postService.createPost(postData);
      if (newPost) {
        return res.status(201).location(`/api/posts/${newPost.id}`).json(
          { status: 201, data: newPost, message: "Post successfully created" }
        );
      }
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
