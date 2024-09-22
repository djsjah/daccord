import { v4 as uuid } from 'uuid';
import PostService from './post.service';
import Post from '../../../database/sequelize/models/post/post.model';
import IPostUpdate from '../validation/interface/post.update.interface';

class PostRevision {
  constructor(
    private readonly postService: PostService
  ) { }

  public async setMainRevision(revisionGroupId: string): Promise<void> {
    const candidateRevision = await this.postService.getAllUserPosts({
      where: {
        isMainRevision: false,
        revisionGroupId: revisionGroupId
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (candidateRevision[0]) {
      await this.postService.updateUserPost(candidateRevision[0], {
        isMainRevision: true
      });
    }
  }

  public async makeRevisionNonMain(mainRevision: Post): Promise<Post> {
    const newRevisionData: IPostUpdate = {
      isMainRevision: false
    };

    if (!mainRevision.revisionGroupId) {
      newRevisionData.revisionGroupId = uuid();
    }

    return (
      await this.postService.updateUserPost(mainRevision, newRevisionData)
    );
  }
}
export default PostRevision;
