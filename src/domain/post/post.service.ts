import { Sequelize } from 'sequelize-typescript';
import { NotFound } from 'http-errors';
import { FindOptions, Op } from 'sequelize';
import Post from '../../database/sequelize/models/post/post.model';
import User from '../../database/sequelize/models/user/user.model';
import DomainService from '../domain.service.abstract';
import ElasticSearchProvider from '../../database/elasticsearch/elasticsearch.provider';
import IRoleSettings from '../role.settings.interface';
import IPostSearch from './validation/interface/post.search.interface';
import IUserPayload from '../auth/validation/interface/user.payload.interface';
import IPostCreate from './validation/interface/post.create.interface';
import IPostUpdate from './validation/interface/post.update.interface';

class PostService extends DomainService {
  private readonly esIndex: string = 'post_idx';
  private readonly esProvider: ElasticSearchProvider;

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

  constructor(esProvider: ElasticSearchProvider) {
    super();
    this.esProvider = esProvider;
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

  public async wordSearch(
    user: IUserPayload,
    searchParam: 'title' | 'content',
    searchString: string
  ): Promise<unknown[]> {
    const queryMust = searchString.split(' ').map(word => ({
      match: {
        [searchParam]: word
      }
    }));

    const wordSearchSettings: IPostSearch = {
      admin: {
        index: this.esIndex,
        query: {
          bool: {
            must: [
              ...queryMust
            ]
          }
        }
      },
      user: {
        index: this.esIndex,
        query: {
          bool: {
            must: [
              ...queryMust,
              {
                term: {
                  authorId: user.id
                }
              }
            ]
          }
        },
        _source_excludes: ['authorId']
      }
    };

    const searchResult = await this.esProvider.searchByRequest(wordSearchSettings[user.role]);
    return searchResult.hits.hits.map(hit => hit._source);
  }

  public async phraseSearch(
    user: IUserPayload,
    searchParam: 'title' | 'content',
    searchString: string
  ): Promise<unknown[]> {
    const matchPhrase = {
      [searchParam]: {
        query: searchString,
        slop: 1
      }
    };

    const phraseSearchSettings: IPostSearch = {
      admin: {
        index: this.esIndex,
        query: {
          match_phrase: matchPhrase
        }
      },
      user: {
        index: this.esIndex,
        query: {
          bool: {
            must: [
              {
                match_phrase: matchPhrase
              },
              {
                term: {
                  authorId: user.id
                }
              }
            ]
          }
        },
        _source_excludes: ['authorId']
      }
    };

    const searchResult = await this.esProvider.searchByRequest(phraseSearchSettings[user.role]);
    return searchResult.hits.hits.map(hit => hit._source);
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

    await this.esProvider.indexDocument(this.esIndex, newPost.id, {
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
    if (newPostData.title) {
      await this.esProvider.updateDocument(this.esIndex, post.id, {
        title: newPostData.title
      });
    }

    if (newPostData.content) {
      await this.esProvider.updateDocument(this.esIndex, post.id, {
        content: newPostData.content
      });
    }

    Object.assign(post, newPostData);
    await post.save();
    return post;
  }

  public async deleteUserPost(post: Post): Promise<void> {
    await this.esProvider.deleteDocument(this.esIndex, post.id);
    await post.destroy();
  }

  public getEsIndex(): string {
    return this.esIndex;
  }
}
export default PostService;
