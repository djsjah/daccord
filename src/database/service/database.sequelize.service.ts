import { Sequelize } from 'sequelize-typescript';
import { ModelCtor } from 'sequelize-typescript';
import IDatabaseService from './database.interface.service';
import IDbConfig from '../config/config.interface';

class SequelizeDatabaseService implements IDatabaseService {
  private sequelize: Sequelize;

  constructor(config: IDbConfig, models: ModelCtor[]) {
    this.sequelize = new Sequelize(config);
    this.sequelize.addModels(models);
  }

  public async sync(): Promise<void> {
    await this.sequelize.sync();
  }
}
export default SequelizeDatabaseService;
