import { Client } from 'pg';
import IDialectService from '../dialect.service.interface';
import ISequelizeConfig from '../../sequelize.config.interface';

class PostgreService implements IDialectService {
  private readonly dbConfig: ISequelizeConfig;

  constructor(dbConfig: ISequelizeConfig) {
    this.dbConfig = dbConfig;
  }

  public async createDbIfNotExists(): Promise<void> {
    const client = new Client({
      ...this.dbConfig,
      user: this.dbConfig.username,
      database: this.dbConfig.dialect
    });

    await client.connect();

    const isDbExist = await client.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${this.dbConfig.database}'`
    );

    if (isDbExist.rows.length === 0) {
      await client.query(`CREATE DATABASE ${this.dbConfig.database}`);
    }

    await client.end();
  }
}
export default PostgreService;
