import { Sequelize, ModelCtor } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import ISequelizeService from './sequelize.service.interface';
import ISequelizeConfig from '../sequelize.config.interface';

class SequelizeService implements ISequelizeService {
  private readonly sequelize: Sequelize;
  private readonly sequelizeStorage: SequelizeStorage;
  private readonly umzug: Umzug<QueryInterface>;

  constructor(config: ISequelizeConfig, models: ModelCtor[]) {
    this.sequelize = new Sequelize(config);
    this.sequelize.addModels(models);
    this.sequelizeStorage = new SequelizeStorage(this.sequelize.getQueryInterface());

    this.umzug = new Umzug({
      storage: this.sequelizeStorage,
      migrations: { glob: `./src/database/migrations/**/*.js` },
      context: this.sequelize.getQueryInterface(),
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
