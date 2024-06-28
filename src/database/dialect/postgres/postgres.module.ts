import dependencyContainer from '../../../utils/lib/dependencyInjection/dependency.container';
import ISequelizeConfig from '../../sequelize/config/sequelize.config.interface';
import PostgreService from './postgres.service';

class PostgreModule {
  constructor(dbConfig: ISequelizeConfig) {
    dependencyContainer.registerInstance('pgService', new PostgreService(dbConfig));
  }
}
export default PostgreModule;
