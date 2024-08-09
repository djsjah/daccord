import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import ElasticSearchProvider from './elasticsearch.provider';
import IElasticSearchOptions from './validation/interface/elasticsearch.options.interface';
import IElastiSearchMethod from './validation/interface/elasticsearch.method.interface';

class ElasticSearchService {
  private readonly esProvider: ElasticSearchProvider;
  private readonly searchSettings: IElastiSearchMethod = {
    wordSearch: (searchOptions: IElasticSearchOptions) => {
      return {
        bool: {
          must: [
            ...searchOptions.request.split(' ').map(word => ({
              match: {
                [searchOptions.param]: word
              }
            }))
          ]
        }
      };
    },
    phraseSearch: (searchOptions: IElasticSearchOptions) => {
      return {
        match_phrase: {
          [searchOptions.param]: {
            query: searchOptions.request,
            slop: searchOptions.slop
          }
        }
      };
    }
  };

  constructor(esProvider: ElasticSearchProvider) {
    this.esProvider = esProvider;
  }

  public async search(searchOptions: IElasticSearchOptions): Promise<unknown[]> {
    const searchRequest: SearchRequest = {
      index: searchOptions.index,
      query: {}
    };

    searchRequest.query = this.searchSettings[searchOptions.method](searchOptions);
    const searchResult = await this.esProvider.searchByRequest(searchRequest);
    return searchResult.hits.hits.map(hit => hit._source);
  }
}
export default ElasticSearchService;
