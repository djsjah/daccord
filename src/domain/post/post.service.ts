import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IPost from './validation/interface/post.interface';
import Post from '../../database/schema/post/post.model';
import UserService from '../user/user.service';
import { NextFunction } from 'express';

class PostService {
  constructor(private readonly userService: UserService) { }

  public async getAllPosts(searchSubstring: string, next: NextFunction): Promise<Post[]> {
    let posts = [];
    if (!searchSubstring) {
      posts = await Post.findAll();
    }
    else {
      posts = await Post.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${searchSubstring}%` } },
            { content: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (posts.length === 0) {
        next(new NotFound(`Posts by search substring: ${searchSubstring} - are not found`));
      }
    }

    return posts;
  }

  public async getPostById(id: string, next: NextFunction): Promise<Post | null> {
    const post = await Post.findByPk(id);
    if (!post) {
      next(new NotFound(`Post with id: ${id} - is not found`));
    }

    return post;
  }

  public async createPost(postData: IPost, next: NextFunction): Promise<Post> {
    await this.userService.getUserById(postData.authorId, next);

    return (
      await Post.create({
        ...postData
      })
    );
  }
}
export default PostService;
