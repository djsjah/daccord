import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

interface IElasticSearchRequest {
  index: string;
  query: {
    bool: {
      must: QueryDslQueryContainer[]
    }
  };
  _source_excludes?: string[];
};
export default IElasticSearchRequest;
