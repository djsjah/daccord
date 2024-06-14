import { Sequelize } from 'sequelize-typescript';
import { ModelCtor } from 'sequelize-typescript';
import ISequelizeService from './sequelize.interface.service';
import ISequelizeConfig from '../sequelize.interface.config';

class SequelizeService implements ISequelizeService {
  private sequelize: Sequelize;

  constructor(config: ISequelizeConfig, models: ModelCtor[]) {
    this.sequelize = new Sequelize(config);
    this.sequelize.addModels(models);
  }

  public async sync(): Promise<void> {
    await this.sequelize.sync();
  }
}
export default SequelizeService;
