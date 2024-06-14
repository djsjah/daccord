import { Op } from 'sequelize';
import { NotFound } from 'http-errors';
import IPost from './validation/interface/post.interface';
import Post from '../../models/post/post.model';
import User from '../../models/user/user.model';
import UserService from '../user/user.service';

class PostService {
  private readonly postAssociations = [
    { model: User, as: 'author' }
  ];

  constructor(private readonly userService: UserService) { }

  public async getAllPosts(searchSubstring: string): Promise<Post[] | never> {
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

  public async getPostById(id: string): Promise<Post | never> {
    const post = await Post.findOne({
      where: { id },
      include: this.postAssociations
    });
    if (!post) {
      throw new NotFound(`Post with id: ${id} - is not found`);
    }

    return post;
  }

  public async createPost(postData: IPost): Promise<Post | never> {
    await this.userService.getUserById(postData.authorId);

    const newPost = await Post.create({
      ...postData
    });

    return this.getPostById(newPost.id);
  }
}
export default PostService;
