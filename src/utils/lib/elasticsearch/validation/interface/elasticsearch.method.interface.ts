import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import IElasticSearchOptions from './elasticsearch.options.interface';

interface IElastiSearchMethod {
  wordSearch: (searchOptions: IElasticSearchOptions) => QueryDslQueryContainer;
  phraseSearch: (searchOptions: IElasticSearchOptions) => QueryDslQueryContainer;
};
export default IElastiSearchMethod;
