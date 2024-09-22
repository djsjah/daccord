import DI from './app.container.js';
import AuthModule from './presentation/auth/auth.module.js';
import PostModule from './presentation/post/index/post.module.js';
import ModalModule from './presentation/modal/index/modal.module.js';

class AppModule {
  async onModuleInit() {
    await DI.registerInstance('authModule', new AuthModule()).onModuleInit();
    DI.registerInstance('modalModule', new ModalModule()).onModuleInit();
    await DI.registerInstance('postModule', new PostModule()).onModuleInit();
  }
}
export default AppModule;
