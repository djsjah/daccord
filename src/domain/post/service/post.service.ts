import { Sequelize } from 'sequelize-typescript';
import { NotFound } from 'http-errors';
import { FindOptions, Op } from 'sequelize';
import Post from '../../../database/sequelize/models/post/post.model';
import User from '../../../database/sequelize/models/user/user.model';
import DomainService from '../../domain.service.abstract';
import PostElasticSearchMediator from './post.elasticsearch.mediator';
import IRoleSettings from '../../role.settings.interface';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IPostCreate from '../validation/interface/post.create.interface';
import IPostUpdate from '../validation/interface/post.update.interface';

class PostService extends DomainService {
  protected override readonly roleSettings: IRoleSettings = {
    admin: {
      include: [
        { model: User, as: 'author' }
      ]
    },
    user: {
      attributes: [
        'id',
        'title',
        'access',
        'content',
        'rating',
        'tags'
      ]
    }
  };

  constructor(
    private readonly postESMediator: PostElasticSearchMediator
  ) {
    super();
  }

  protected override findOptionsRoleFilter(findOptions: FindOptions, user: IUserPayload): FindOptions {
    const roleSpecificOptions = this.roleSettings[user.role];
    if (user.role === 'user') {
      findOptions.where = {
        ...findOptions.where,
        authorId: user.id
      }
    }

    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  private findOptionsJoinLiteral(findOptions: FindOptions, literalQuery: string) {
    findOptions.where = {
      [Op.and]: [
        {
          ...findOptions.where
        },
        Sequelize.literal(literalQuery)
      ]
    };

    return findOptions
  }

  private setupFindOptions(
    findOptions: FindOptions,
    user: IUserPayload | undefined,
    literalQuery: string | undefined
  ) {
    if (user) {
      findOptions = this.findOptionsRoleFilter(findOptions, user);
    }

    if (literalQuery) {
      findOptions = this.findOptionsJoinLiteral(findOptions, literalQuery);
    }

    return findOptions;
  }

  public async getAllUserPosts(
    findOptions: FindOptions,
    user?: IUserPayload,
    literalQuery?: string
  ): Promise<Post[]> {
    findOptions = this.setupFindOptions(findOptions, user, literalQuery);
    const posts = await Post.findAll(findOptions);
    return posts;
  }

  public async getPostByUniqueParams(
    findOptions: FindOptions,
    user?: IUserPayload,
    literalQuery?: string
  ): Promise<Post> {
    findOptions = this.setupFindOptions(findOptions, user, literalQuery);
    const post = await Post.findOne(findOptions);

    if (!post) {
      throw new NotFound("Post is not found");
    }

    return post;
  }

  public async createUserPost(user: IUserPayload, postDataCreate: IPostCreate): Promise<Post> {
    const newPost = await Post.create({
      ...postDataCreate
    });

    await this.postESMediator.addDocumentToIndex({
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId
    });

    return (
      await this.getPostByUniqueParams({
        where: {
          id: newPost.id
        }
      }, user)
    );
  }

  public async updateUserPost(post: Post, newPostData: IPostUpdate): Promise<Post> {
    await this.postESMediator.updateDocumentInIndex(post, newPostData);

    Object.assign(post, newPostData);
    await post.save();
    return post;
  }

  public async deleteUserPost(post: Post): Promise<void> {
    await this.postESMediator.deleteDocumentFromIndex(post.id);
    await post.destroy();
  }
}
export default PostService;
