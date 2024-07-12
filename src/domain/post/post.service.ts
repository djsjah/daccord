import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import Post from '../../database/models/post/post.model';
import User from '../../database/models/user/user.model';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import IPostCreate from './validation/interface/post.create.interface';
import IPostUpdate from './validation/interface/post.update.interface';

class PostService {
  private readonly postAssociations = [
    { model: User, as: 'author' }
  ];

  private readonly publicPostData = [
    'id',
    'title',
    'access',
    'content',
    'rating',
    'tags'
  ];

  public async getAllUserPosts(user: IUserPayload, searchSubstring: string): Promise<Post[]> {
    let posts: Post[] = [];

    if (user.role === 'admin' && !searchSubstring) {
      posts = await Post.findAll({
        include: this.postAssociations
      });
    }
    else if (user.role === 'user' && !searchSubstring) {
      posts = await Post.findAll({
        where: {
          authorId: user.id
        },
        attributes: this.publicPostData
      });
    }
    else if (user.role === 'admin' && searchSubstring) {
      posts = await Post.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${searchSubstring}%` } },
            { content: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        include: this.postAssociations
      });

      if (posts.length === 0) {
        throw new NotFound(`Posts by search substring: ${searchSubstring} - are not found`);
      }
    }
    else if (user.role === 'user' && searchSubstring) {
      posts = await Post.findAll({
        where: {
          authorId: user.id,
          [Op.or]: [
            { title: { [Op.like]: `%${searchSubstring}%` } },
            { content: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        attributes: this.publicPostData
      });

      if (posts.length === 0) {
        throw new NotFound(`Posts by search substring: ${searchSubstring} - are not found`);
      }
    }

    return posts;
  }

  public async getUserPostById(user: IUserPayload, postId: string, isMainData: boolean = false): Promise<Post> {
    let post;

    if (user.role === 'admin' && !isMainData) {
      post = await Post.findOne({
        where: {
          id: postId
        },
        include: this.postAssociations
      });
    }
    else if (user.role === 'admin' && isMainData) {
      post = await Post.findOne({
        where: {
          id: postId
        }
      });
    }
    else if (user.role === 'user' && !isMainData) {
      post = await Post.findOne({
        where: {
          id: postId,
          authorId: user.id
        },
        attributes: this.publicPostData
      });
    }
    else if (user.role === 'user' && isMainData) {
      post = await Post.findOne({
        where: {
          id: postId,
          authorId: user.id
        }
      });
    }

    if (!post) {
      throw new NotFound(`Post with id: ${postId} - is not found`);
    }

    return post;
  }

  public async createUserPost(user: IUserPayload, postDataCreate: IPostCreate): Promise<Post> {
    const newPost = await Post.create({
      ...postDataCreate
    });

    return (
      await this.getUserPostById(user, newPost.id)
    );
  }

  public async updateUserPostById(user: IUserPayload, postId: string, newPostData: IPostUpdate): Promise<Post> {
    if (user.role === 'admin') {
      await Post.update(newPostData, {
        where: {
          id: postId
        }
      })
    }
    else if (user.role === 'user') {
      await Post.update(newPostData, {
        where: {
          id: postId,
          authorId: user.id
        }
      })
    }

    return (
      await this.getUserPostById(user, postId)
    );
  }

  public async deleteUserPostById(user: IUserPayload, postId: string): Promise<void> {
    const post = await this.getUserPostById(user, postId, true);
    await post.destroy();
  }
}
export default PostService;
