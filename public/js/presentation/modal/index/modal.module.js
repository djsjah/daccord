import DI from '../../../app.container.js';
import ModalUtils from '../modal.utils.js';
import ModalAuth from '../modal.auth.js';
import PostConstructor from '../modal.post.constructor.js';
import PostMutator from '../modal.post.mutator.js';
import PostDestructor from '../modal.post.destructor.js';

class ModalModule {
  onModuleInit() {
    const modalUtils = DI.registerInstance('modalUtils', new ModalUtils());
    modalUtils.init();

    DI.registerInstance('modalAuth', new ModalAuth(
      DI.getInstance('userAuth'),
      modalUtils
    )).init();
    DI.registerInstance('postConstructor', new PostConstructor(modalUtils)).init();
    DI.registerInstance('postMutator', new PostMutator(modalUtils)).init();
    DI.registerInstance('postDestructor', new PostDestructor(modalUtils)).init();
  }
}
export default ModalModule;
