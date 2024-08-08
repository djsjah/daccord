import {
  SearchRequest,
  QueryDslQueryContainer,
  QueryDslMatchPhraseQuery
} from '@elastic/elasticsearch/lib/api/types';
import ElasticSearchProvider from './elasticsearch.provider';
import IElasticSearchOptions from './validation/interface/elasticsearch.options.interface';
import IElasticSearchSettings from './validation/interface/elasticsearch.settings.interface';

class ElasticSearchService {
  private readonly esProvider: ElasticSearchProvider;
  private readonly searchSettings: IElasticSearchSettings = {
    admin: {
      wordSearch: (searchOptions: IElasticSearchOptions) => {
        return {
          bool: {
            must: [
              ...this.setWordSearchRequest(searchOptions.param, searchOptions.request)
            ]
          }
        };
      },
      phraseSearch: (searchOptions: IElasticSearchOptions) => {
        return {
          match_phrase: this.setPhraseSearchRequest(
            searchOptions.param,
            searchOptions.request,
            searchOptions.slop
          )
        };
      }
    },
    user: {
      wordSearch: (searchOptions: IElasticSearchOptions) => {
        return {
          bool: {
            must: [
              ...this.setWordSearchRequest(searchOptions.param, searchOptions.request),
              {
                term: {
                  authorId: searchOptions.user.id
                }
              }
            ]
          }
        };
      },
      phraseSearch: (searchOptions: IElasticSearchOptions) => {
        return {
          bool: {
            must: [
              {
                match_phrase: this.setPhraseSearchRequest(
                  searchOptions.param,
                  searchOptions.request,
                  searchOptions.slop
                )
              },
              {
                term: {
                  authorId: searchOptions.user.id
                }
              }
            ]
          }
        };
      }
    }
  };

  constructor(esProvider: ElasticSearchProvider) {
    this.esProvider = esProvider;
  }

  private setWordSearchRequest(searchParam: string, searchRequest: string): Array<QueryDslQueryContainer> {
    return (
      searchRequest.split(' ').map(word => ({
        match: {
          [searchParam]: word
        }
      }))
    );
  }

  private setPhraseSearchRequest(
    searchParam: string,
    searchRequest: string,
    slop: number
  ): Partial<Record<string, string | QueryDslMatchPhraseQuery>>
  {
    return {
      [searchParam]: {
        query: searchRequest,
        slop: slop
      }
    };
  }

  public async search(searchOptions: IElasticSearchOptions): Promise<unknown[]> {
    const searchRequest: SearchRequest = {
      index: searchOptions.index,
      query: {},
      _source_excludes: searchOptions.exceptions
    };

    searchRequest.query = this.searchSettings[searchOptions.user.role][searchOptions.method](searchOptions);

    const searchResult = await this.esProvider.searchByRequest(searchRequest);
    return searchResult.hits.hits.map(hit => hit._source);
  }
}
export default ElasticSearchService;
