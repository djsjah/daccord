import { NextFunction, Request, Response } from 'express';
import express from 'express';
import PostService from './post.service';
import PostSchema from './validation/schema/post.schema';
import userModule from '../user/user.module';

const postRouter = express.Router();
const postService: PostService = new PostService(userModule.getUserServiceSingleton());

postRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const searchSubstring = req.query.search || '';
  const posts = await postService.getAllPosts(searchSubstring as string, next);

  if (!res.headersSent) {
    res.json(posts);
  }
});

postRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const post = await postService.getPostById(id, next);

  if (post) {
    res.json(post);
  }
});

postRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const postData = req.body;
  const { error } = PostSchema.validate(postData);

  if (error) {
    return res.status(422).send(`Validation error: ${error.details[0].message}`);
  }

  const newPost = await postService.createPost(postData, next);
  if (newPost) {
    res.status(201).location(`/api/users/${newPost.id}`).json(newPost);
  }
});

export default postRouter;
