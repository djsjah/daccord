import DI from '../../js/app.container.js';
import AuthModule from '../../js/presentation/auth/auth.module.js';
import PostModule from '../../js/presentation/post/post.module.js';
import ModalModule from '../../js/presentation/modal/post/modal.module.js';

class AppModule {
  async onModuleInit() {
    await DI.registerInstance('authModule', new AuthModule()).onModuleInit();
    DI.registerInstance('modalModule', new ModalModule()).onModuleInit();
    await DI.registerInstance('postModule', new PostModule()).onModuleInit();
  }
}
export default AppModule;
