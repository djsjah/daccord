import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';

interface IPostSearch {
  admin: SearchRequest;
  user: SearchRequest;
};
export default IPostSearch;
