import { Dialect } from 'sequelize';

interface ISequelizeConfig {
  dialect: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
export default ISequelizeConfig;
