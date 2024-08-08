import dependencyContainer from '../utils/lib/dependencyInjection/dependency.container';
import PostgreModule from './sequelize/dialect/postgres/postgres.module';
import SequelizeModule from './sequelize/sequelize.module';
import PostgreService from './sequelize/dialect/postgres/postgres.service';
import User from './sequelize/models/user/user.model';
import UserContact from './sequelize/models/user/user.contact.model';
import Post from './sequelize/models/post/post.model';
import Subscription from './sequelize/models/subscription/subscription.model';
import ISequelizeConfig from './sequelize/sequelize.config.interface';

class DatabaseModule {
  public async onModuleInit() {
    const seqConfig: ISequelizeConfig = {
      dialect: 'postgres',
      host: process.env.DATABASE_HOST_DEV!,
      port: Number(process.env.DATABASE_PORT_DEV!),
      username: process.env.DATABASE_USERNAME_DEV!,
      password: process.env.DATABASE_PASSWORD_DEV!,
      database: process.env.DATABASE_NAME_DEV!
    };

    dependencyContainer.registerInstance('pgModule', new PostgreModule(seqConfig));
    dependencyContainer.registerInstance('seqModule', new SequelizeModule(
      seqConfig,
      [
        User,
        UserContact,
        Post,
        Subscription
      ],
      dependencyContainer.getInstance<PostgreService>('pgService')
    ));
    await dependencyContainer.getInstance<SequelizeModule>('seqModule').onModuleInit();
  }
}
export default DatabaseModule;
