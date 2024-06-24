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

  constructor(
    private readonly userService: UserService,
    private readonly notifGateway: NotificationGateway
  ) { }

  public async getAllPosts(searchSubstring: string): Promise<Post[]> {
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

  public async getPostById(postId: string): Promise<Post> {
    const post = await Post.findOne({
      where: { id: postId },
      include: this.postAssociations
    });
    if (!post) {
      throw new NotFound(`Post with id: ${postId} - is not found`);
    }

    return post;
  }

  public async createPost(postDataCreate: IPostCreate): Promise<Post> {
    const user = await this.userService.getUserById(postDataCreate.authorId);

    const newPost = await Post.create({
      ...postDataCreate
    });

    this.notifGateway.sendNotification(JSON.stringify({
      text: `user ${user.name} created a new post`,
      data: newPost,
      userId: user.id
    }));

    return this.getPostById(newPost.id);
  }

  public async updatePostById(postId: string, newPostData: IPostUpdate): Promise<Post> {
    const post = await this.getPostById(postId);
    Object.assign(post, newPostData);
    await post.save();

    const user = await this.userService.getUserById(post.authorId);

    this.notifGateway.sendNotification(JSON.stringify({
      text: `user ${user.name} updated his post ${post.title}`,
      data: post,
      userId: user.id
    }));

    return post;
  }

  public async deletePostById(postId: string): Promise<void> {
    const post = await this.getPostById(postId);
    await post.destroy();
  }
}
export default PostService;
