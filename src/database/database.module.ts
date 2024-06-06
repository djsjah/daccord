import { ModelCtor } from 'sequelize-typescript';
import IDatabaseService from './service/database.interface.service';
import IDbConfig from './config/config.interface';
import SequelizeDatabaseService from './service/database.sequelize.service';

class DatabaseModule {
  private dbService: IDatabaseService;

  constructor(
    private readonly dbConfig: IDbConfig,
    private readonly models: ModelCtor[]
  ) {
    this.dbService = new SequelizeDatabaseService(this.dbConfig, this.models);
  }

  public async onModuleInit() {
    await this.dbService.sync();
  }
}
export default DatabaseModule;
