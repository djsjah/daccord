import IUserPayload from '../../../../../domain/auth/validation/interface/user.payload.interface';
import ElasticSearchMethod from '../enum/elasticsearch.method';

interface IElasticSearchOptions {
  index: string;
  param: string;
  method: ElasticSearchMethod;
  request: string;
  slop: number
};
export default IElasticSearchOptions;
