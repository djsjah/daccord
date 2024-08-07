import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import ElasticSearchProvider from './elasticsearch.provider';

class ElasticSearchModule {
  constructor() {
    dependencyContainer.registerInstance('esProvider', new ElasticSearchProvider());
  }
}
export default ElasticSearchModule;
