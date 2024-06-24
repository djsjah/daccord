import { ModelCtor } from 'sequelize-typescript';
import dependencyContainer from '../../utils/lib/dependencyInjection/dependency.container';
import ISequelizeService from './service/sequelize.service.interface';
import ISequelizeConfig from './sequelize.config.interface';
import SequelizeService from './service/sequelize.service';
import IDialectService from '../dialect/dialect.service.interface';

class SequelizeModule {
  private seqService: ISequelizeService;

  constructor(
    private readonly dbConfig: ISequelizeConfig,
    private readonly models: ModelCtor[],
    private readonly dialectService: IDialectService
  ) {
    this.seqService = new SequelizeService(this.dbConfig, this.models);
    dependencyContainer.registerInstance('seqService', this.seqService);
  }

  public async onModuleInit(): Promise<void> {
    await this.dialectService.createDbIfNotExists();
    await this.seqService.syncWithDb();
  }
}
export default SequelizeModule;
