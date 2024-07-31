import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';

interface IPhraseSearch {
  admin: SearchRequest;
  user: SearchRequest;
};
export default IPhraseSearch;
