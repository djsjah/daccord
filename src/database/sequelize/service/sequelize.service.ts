import { Sequelize } from 'sequelize-typescript';
import { ModelCtor } from 'sequelize-typescript';
import ISequelizeService from './sequelize.service.interface';
import ISequelizeConfig from '../sequelize.config.interface';

class SequelizeService implements ISequelizeService {
  private readonly sequelize: Sequelize;

  constructor(config: ISequelizeConfig, models: ModelCtor[]) {
    this.sequelize = new Sequelize(config);
    this.sequelize.addModels(models);
  }

  public async syncWithDb(): Promise<void> {
    await this.sequelize.sync();
  }
}
export default SequelizeService;
