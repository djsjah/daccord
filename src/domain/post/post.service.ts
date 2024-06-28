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

  public async getAllUserPosts(userId: string, searchSubstring: string): Promise<Post[]> {
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
        throw new NotFound(`Posts by search substring: ${searchSubstring} - are not found`);
      }
    }

    return posts;
  }

  public async getPostById(postId: string, isPublicData = false): Promise<Post> {
    let post;

    if (!isPublicData) {
      post = await Post.findOne({
        where: { id: postId },
        include: this.postAssociations
      });
    }
    else {
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

  public async getPostByTitle(postTitle: string, isPublicData = true) {
    let post;

    if (isPublicData) {
      post = await Post.findOne({
        where: { title: postTitle },
        attributes: this.publicPostData
      });
    }
    else {
      post = await Post.findOne({
        where: { title: postTitle }
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
      await this.getPostById(newPost.id, true)
    );
  }

  public async updatePostByTitle(postTitle: string, newPostData: IPostUpdate): Promise<Post> {
    const post = await this.getPostByTitle(postTitle, false);
    Object.assign(post, newPostData);
    await post.save();

    return post;
  }

  public async deletePostByTitle(postTitle: string): Promise<void> {
    const post = await this.getPostByTitle(postTitle, false);
    await post.destroy();
  }
}
export default PostService;
