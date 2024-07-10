import dependencyContainer from '../dependencyInjection/dependency.container';
import JWTStrategy from './jwt.strategy';

class JWTModule {
  constructor() {
    dependencyContainer.registerInstance('jwtStrategy', new JWTStrategy());
  }
}
export default JWTModule;
