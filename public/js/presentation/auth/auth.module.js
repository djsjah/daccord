import DI from '../../app.container.js';
import UserAuth from './auth.js';

class AuthModule {
  async onModuleInit() {
    await DI.registerInstance('userAuth', new UserAuth()).init();
  }
}
export default AuthModule;
