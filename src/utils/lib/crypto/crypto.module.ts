import dependencyContainer from '../dependencyInjection/dependency.container';
import CryptoProvider from './crypto.provider';

class CryptoModule {
  constructor() {
    dependencyContainer.registerInstance('cryptoProvider', new CryptoProvider());
  }
}
export default CryptoModule;
