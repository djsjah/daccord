import DI from '../../app.container.js';
import PostHistory from './post.history.js';

class PostModule {
  async onModuleInit() {
    await DI.registerInstance('post', new PostHistory(
      DI.getInstance('userAuth'),
      DI.getInstance('postMutator'),
      DI.getInstance('postDestructor')
    )).init();
  }
}
export default PostModule;
