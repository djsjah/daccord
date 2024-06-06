import { Dialect } from 'sequelize';

interface IDbConfig {
  dialect: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
export default IDbConfig;
