import ElasticSearchMethod from '../enum/elasticsearch.method';

interface IElasticSearchOptions {
  index: string;
  param: string;
  method: ElasticSearchMethod;
  request: string;
  slop: number;
  term?: Partial<Record<string, any>>;
  excludes?: string[];
};
export default IElasticSearchOptions;
