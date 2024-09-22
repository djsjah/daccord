import { NotFound } from 'http-errors';
import { FindOptions } from 'sequelize';
import Post from '../../../database/sequelize/models/post/post.model';
import DomainService from '../../domain.service.abstract';
import PostElasticSearchMediator from './post.elasticsearch.mediator';
import RoleSettingsType from '../../role.settings.interface';
import IUserPayload from '../../auth/validation/interface/user.payload.interface';
import IPostCreate from '../validation/interface/post.create.interface';
import IPostUpdate from '../validation/interface/post.update.interface';
import PostPublicFields from '../validation/enum/post.public.fields.enum';
import PostRevisonFields from '../validation/enum/post.revision.fields.enum';
import UserRole from '../../user/validation/enum/user.role.enum';

class PostService extends DomainService {
  private readonly postPublicFields: PostPublicFields[] = Object.values(PostPublicFields);

  protected override readonly roleSettings: RoleSettingsType = {
    admin: {},
    user: {
      attributes: this.postPublicFields
    }
  };

  constructor(
    private readonly postESMediator: PostElasticSearchMediator
  ) {
    super();
  }

  protected override modelRoleFilter(post: Post, userRole: UserRole): Partial<Post> {
    return userRole === 'user' ?
      Object.fromEntries(
        Object.entries(post)
          .filter(([key]) => this.postPublicFields.includes(key as PostPublicFields))
      ) : post;
  }

  protected override findOptionsRoleFilter(findOptions: FindOptions, user: IUserPayload): FindOptions {
    const roleSpecificOptions = this.roleSettings[user.role];
    if (user.role === 'user') {
      findOptions.where = {
        ...findOptions.where,
        authorId: user.id
      };
    }

    Object.assign(findOptions, roleSpecificOptions);
    return findOptions;
  }

  public async getAllUserPosts(findOptions: FindOptions, user?: IUserPayload): Promise<Post[]> {
    findOptions = user ?
      this.findOptionsRoleFilter(findOptions, user) : findOptions;

    const posts = await Post.findAll({
      ...findOptions
    });

    return posts;
  }

  public async getPostByUniqueParams(findOptions: FindOptions, user?: IUserPayload): Promise<Post> {
    findOptions = user ?
      this.findOptionsRoleFilter(findOptions, user) : findOptions;

    const post = await Post.findOne(findOptions);
    if (!post) {
      throw new NotFound("Post is not found");
    }

    return post;
  }

  public async createUserPost(
    userRole: UserRole,
    postDataCreate: IPostCreate | IPostUpdate,
    mainRevision?: Post
  ): Promise<Partial<Post>> {
    await this.postESMediator.checkConnection();
    const newPost = await Post.create({
      ...(mainRevision && Object.fromEntries(
        Object.entries(PostRevisonFields).map(([key]) => [
          key,
          mainRevision[key as PostRevisonFields]
        ])
      )),
      ...postDataCreate
    });

    await this.postESMediator.addDocumentToIndex({
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId
    });

    return this.modelRoleFilter(newPost, userRole);
  }

  public async updateUserPost(post: Post, newPostData: IPostUpdate): Promise<Post> {
    await this.postESMediator.checkConnection();
    await this.postESMediator.updateDocumentInIndex(post, newPostData);

    Object.assign(post, newPostData);
    await post.save();
    return post;
  }

  public async deleteUserPost(post: Post): Promise<void> {
    await this.postESMediator.checkConnection();
    await this.postESMediator.deleteDocumentFromIndex(post.id);
    await post.destroy();
  }
}
export default PostService;
