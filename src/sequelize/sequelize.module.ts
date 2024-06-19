import { ModelCtor } from 'sequelize-typescript';
import { Client } from 'pg';
import dependencyContainer from '../dependencyInjection/dependency.container';
import ISequelizeService from './service/sequelize.interface.service';
import ISequelizeConfig from './sequelize.interface.config';
import SequelizeService from './service/sequelize.service';

class SequelizeModule {
  private seqService: ISequelizeService;

  constructor(
    private readonly dbConfig: ISequelizeConfig,
    private readonly models: ModelCtor[]
  ) {
    this.seqService = new SequelizeService(this.dbConfig, this.models);
    dependencyContainer.registerInstance('seqService', this.seqService);
  }

  public async onModuleInit() {
    await this.createDbIfNotExists();
    await this.seqService.sync();
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
export default SequelizeModule;
