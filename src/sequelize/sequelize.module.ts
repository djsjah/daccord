import { ModelCtor } from 'sequelize-typescript';
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
    await this.seqService.sync();
  }
}
export default SequelizeModule;
