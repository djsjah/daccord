import dependencyContainer from '../dependencyInjection/dependency.container';
import ElasticSearchService from './elasticsearch.service';
import ElasticSearchProvider from './elasticsearch.provider';

class ElasticSearchModule {
  private readonly esService: ElasticSearchService;
  private readonly esProvider: ElasticSearchProvider;

  constructor() {
    this.esProvider = new ElasticSearchProvider();
    this.esService = new ElasticSearchService(
      this.esProvider
    );

    dependencyContainer.registerInstance('esService', this.esService);
    dependencyContainer.registerInstance('esProvider', this.esProvider);
  }
}
export default ElasticSearchModule;
