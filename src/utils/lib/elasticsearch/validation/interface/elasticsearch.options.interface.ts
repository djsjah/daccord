import IUserPayload from '../../../../../domain/auth/validation/interface/user.payload.interface';
import ElasticSearchMethod from '../enum/elasticsearch.method';

interface IElasticSearchOptions {
  index: string;
  user: IUserPayload;
  param: string;
  method: ElasticSearchMethod;
  request: string;
  slop: number;
  restrictions: {
    userIdField: string,
    exceptions?: string[];
  }
};
export default IElasticSearchOptions;
