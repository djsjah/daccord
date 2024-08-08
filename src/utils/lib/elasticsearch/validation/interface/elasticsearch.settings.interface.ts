import IElastiSearchMethod from "./elasticsearch.method.interface";

interface IElasticSearchSettings {
  admin: IElastiSearchMethod,
  user: IElastiSearchMethod
};
export default IElasticSearchSettings;
