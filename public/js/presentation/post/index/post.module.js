import DI from '../../../app.container.js';
import Post from '../post.js';
import PostSearch from '../post.search.js';

class PostModule {
  async onModuleInit() {
    DI.registerInstance('postSearch', new PostSearch()).init();
    await DI.registerInstance('post', new Post(
      DI.getInstance('userAuth'),
      DI.getInstance('postMutator'),
      DI.getInstance('postDestructor')
    )).init();
  }
}
export default PostModule;
