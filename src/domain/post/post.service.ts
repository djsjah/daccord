import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IPostCreate from './validation/interface/post.create.interface';
import IPostUpdate from './validation/interface/post.update.interface';
import Post from '../../database/models/post/post.model';
import User from '../../database/models/user/user.model';
import UserService from '../user/service/user.service';
import NotificationGateway from '../../utils/lib/notification/notification.gateway';

class PostService {
  private readonly postAssociations = [
    { model: User, as: 'author' }
  ];

  private readonly publicPostData = [
    'title',
    'access',
    'content',
    'rating',
    'tags'
  ];

  constructor(
    private readonly userService: UserService,
    private readonly notifGateway: NotificationGateway
  ) { }

  public async getAllUsersPosts(searchSubstring: string): Promise<Post[]> {
    let posts = [];
    if (!searchSubstring) {
      posts = await Post.findAll({
        include: this.postAssociations
      });
    }
    else {
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

    return posts;
  }

  public async getAllUserPostsByUserId(userId: string, searchSubstring: string): Promise<Post[]> {
    let posts = [];
    if (!searchSubstring) {
      posts = await Post.findAll({
        where: {
          authorId: userId
        },
        attributes: this.publicPostData
      });
    }
    else {
      posts = await Post.findAll({
        where: {
          authorId: userId,
          [Op.or]: [
            { title: { [Op.like]: `%${searchSubstring}%` } },
            { content: { [Op.like]: `%${searchSubstring}%` } }
          ]
        },
        attributes: this.publicPostData
      });

      if (posts.length === 0) {
        throw new NotFound(
          `Posts by author id: ${userId} and search substring: ${searchSubstring} - are not found`
        );
      }
    }

    return posts;
  }

  public async getPostById(postId: string, includeAssociations = true, isPublicData = false): Promise<Post> {
    let post;

    if (includeAssociations && !isPublicData) {
      post = await Post.findOne({
        where: { id: postId },
        include: this.postAssociations
      });
    }
    else if (!includeAssociations && !isPublicData) {
      post = await Post.findOne({
        where: { id: postId }
      });
    }
    else if (!includeAssociations && isPublicData) {
      post = await Post.findOne({
        where: { id: postId },
        attributes: this.publicPostData
      });
    }

    if (!post) {
      throw new NotFound(`Post with id: ${postId} - is not found`);
    }

    return post;
  }

  public async getUserPostByTitle(userId: string, postTitle: string, isPublicData = true): Promise<Post> {
    let post;

    if (isPublicData) {
      post = await Post.findOne({
        where: {
          title: postTitle,
          authorId: userId
        },
        attributes: this.publicPostData
      });
    }
    else {
      post = await Post.findOne({
        where: {
          title: postTitle,
          authorId: userId
        },
        include: this.postAssociations
      });
    }

    if (!post) {
      throw new NotFound(`Post with title: ${postTitle} - is not found`);
    }

    return post;
  }

  public async createPost(postDataCreate: IPostCreate): Promise<Post> {
    const newPost = await Post.create({
      ...postDataCreate
    });

    return (
      await this.getPostById(newPost.id, false, true)
    );
  }

  public async updatePostById(postId: string, newPostData: IPostUpdate): Promise<Post> {
    const post = await this.getPostById(postId, false);
    Object.assign(post, newPostData);
    await post.save();

    return post;
  }

  public async updateUserPostByTitle(
    userId: string,
    postTitle: string,
    newPostData: IPostUpdate
  ): Promise<Post> {
    const post = await this.getUserPostByTitle(userId, postTitle, false);
    Object.assign(post, newPostData);
    await post.save();

    return (
      await this.getPostById(post.id, false, true)
    );
  }

  public async deletePostById(postId: string): Promise<void> {
    const post = await this.getPostById(postId);
    await post.destroy();
  }

  public async deleteUserPostByTitle(userId: string, postTitle: string): Promise<void> {
    const post = await this.getUserPostByTitle(userId, postTitle, false);
    await post.destroy();
  }
}
export default PostService;
