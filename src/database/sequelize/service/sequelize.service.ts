import { Sequelize } from 'sequelize-typescript';
import { ModelCtor } from 'sequelize-typescript';
import { Umzug, SequelizeStorage } from 'umzug';
import ISequelizeService from './sequelize.service.interface';
import ISequelizeConfig from '../config/sequelize.config.interface';

class SequelizeService implements ISequelizeService {
  private readonly sequelize: Sequelize;
  private readonly umzug;

  constructor(config: ISequelizeConfig, models: ModelCtor[]) {
    this.sequelize = new Sequelize(config);
    this.sequelize.addModels(models);

    const seq = this.sequelize;
    const sequelizeStorage = new SequelizeStorage(this.sequelize.getQueryInterface());

    this.umzug = new Umzug({
      storage: sequelizeStorage,
      migrations: { glob: `./src/database/migrations/*.js` },
      context: seq.getQueryInterface(),
      logger: console,
    });
  }

  public async syncWithDb(): Promise<void> {
    try {
      await this.sequelize.sync();
      await this.umzug.up();
    }
    catch (err) {
      console.log(err);
    }
  }
}
export default SequelizeService;
