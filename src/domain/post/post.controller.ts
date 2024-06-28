import { NextFunction, Request, Response } from 'express';
import { PostGetByTitleSchema } from './validation/schema/post.get.schema';
import PostService from './post.service';
import PostCreateSchema from './validation/schema/post.create.schema';
import PostUpdateSchema from './validation/schema/post.update.schema';

class PostController {
  constructor(private readonly postService: PostService) { }

  public async getAllUserPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchSubstring = req.query.search || '';
      const userId = req.session.user?.id || '';
      const posts = await this.postService.getAllUserPosts(userId, searchSubstring as string);
      return res.status(200).json({ status: 200, data: posts, message: "List of all posts" });
    }
    catch (err) {
      next(err);
    }
  }

  public async getPostByTitle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postTitle = req.params.postTitle;
      const { error } = PostGetByTitleSchema.validate(postTitle);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const post = await this.postService.getPostByTitle(postTitle);
      return res.status(200).json({ status: 200, data: post, message: "Post details" });
    }
    catch (err) {
      next(err);
    }
  }

  public async createPost(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.session.user?.id || '';
      const postDataCreate = req.body;
      const { error } = PostCreateSchema.validate(postDataCreate);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      const newPost = await this.postService.createPost({
        ...postDataCreate,
        authorId: userId
      });

      return res.status(201).location(`/api/posts/${newPost.id}`).json(
        { status: 201, data: newPost, message: "Post successfully created" }
      );
    }
    catch (err) {
      next(err);
    }
  }

  public async updatePostByTitle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postTitle = req.params.postTitle;
      const postTitleValid = PostGetByTitleSchema.validate(postTitle);

      if (postTitleValid.error) {
        return res.status(422).send(`Validation error: ${postTitleValid.error.details[0].message}`);
      }

      const newPostData = req.body;
      const newPostDataValid = PostUpdateSchema.validate(newPostData);

      if (newPostDataValid.error) {
        return res.status(422).send(`Validation error: ${newPostDataValid.error.details[0].message}`);
      }

      const updatedPost = await this.postService.updatePostByTitle(postTitle, newPostData);
      return res.status(200).json({
        status: 200,
        data: {
          title: updatedPost.title,
          access: updatedPost.access,
          content: updatedPost.content,
          tags: updatedPost.tags
        },
        message: "Post successfully updated"
      });
    }
    catch (err) {
      next(err);
    }
  }

  public async deletePostByTitle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const postTitle = req.params.postTitle;
      const { error } = PostGetByTitleSchema.validate(postTitle);

      if (error) {
        return res.status(422).send(`Validation error: ${error.details[0].message}`);
      }

      await this.postService.deletePostByTitle(postTitle);
      return res.status(200).json({ status: 200, message: "Post successfully deleted" });
    }
    catch (err) {
      next(err);
    }
  }
}
export default PostController;
