import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import PostModel from '../../database/schema/post/post.model';
import PostDTO from './dto/post.dto';
import UserService from '../user/user.service';

@Injectable()
class PostService {
  constructor(
    @InjectModel(PostModel) private readonly postModel: typeof PostModel,
    private readonly userService: UserService
  ) { }

  async getAllPosts(searchSubstring: string): Promise<PostModel[] | never> {
    let posts = [];
    if (!searchSubstring) {
      posts = await this.postModel.findAll();
    }
    else {
      posts = await this.postModel.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${searchSubstring}%` } },
            { content: { [Op.like]: `%${searchSubstring}%` } }
          ]
        }
      });

      if (posts.length === 0) {
        throw new NotFoundException(`Posts by search substring: ${searchSubstring} - not found`);
      }
    }

    return posts;
  }

  async getPostById(id: string): Promise<PostModel | never> {
    const post = await this.postModel.findByPk(id);
    if (!post) {
      throw new NotFoundException(`User with id ${id} - not found`);
    }

    return post;
  }

  async createPost(postData: PostDTO): Promise<PostModel | never> {
    await this.userService.getUserById(postData.authorId);

    return (
      await this.postModel.create({
        ...postData
      })
    );
  }

  async completelyUpdatePost() { }

  async partiallyUpdatePost() { }

  async removePost() { }
}
export default PostService;
