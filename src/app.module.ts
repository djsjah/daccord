import dotenv from 'dotenv';
import dependencyContainer from './utils/lib/dependencyInjection/dependency.container';
import ISequelizeConfig from './database/sequelize/sequelize.config.interface';
import SequelizeModule from './database/sequelize/sequelize.module';
import PostgreModule from './database/dialect/postgres/postgres.module';
import PostgreService from './database/dialect/postgres/postgres.service';
import AppRouter from './app.routes';
import AppController from './app.controller';
import MailerModule from './utils/lib/mailer/mailer.module';
import CryptoModule from './utils/lib/crypto/crypto.module';
import JWTModule from './utils/lib/jwt/jwt.module';
import NotificationModule from './utils/lib/notification/notification.module';
import UserModule from './domain/user/user.module';
import AuthModule from './domain/auth/auth.module';
import PostModule from './domain/post/post.module';
import SubscriptionModule from './domain/subscription/subscription.module';
import User from './database/models/user/user.model';
import UserContact from './database/models/user/user.contact.model';
import Post from './database/models/post/post.model';
import Subscription from './database/models/subscription/subscription.model';

class AppModule {
  public async load(): Promise<void> {
    dotenv.config();

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

    dependencyContainer.registerInstance('appController', new AppController());
    dependencyContainer.registerInstance('appRouter', new AppRouter());
    dependencyContainer.registerInstance('mailerModule', new MailerModule({
      host: 'localhost',
      service: process.env.EMAIL_SERVICE_DEV,
      auth: {
        user: process.env.EMAIL_USERNAME_DEV,
        pass: process.env.EMAIL_PASSWORD_DEV
      },
      tls: {
        rejectUnauthorized: false
      }
    }));
    dependencyContainer.registerInstance('cryptoModule', new CryptoModule());
    dependencyContainer.registerInstance('notifModule', new NotificationModule());
    dependencyContainer.registerInstance('jwtModule', new JWTModule());
    dependencyContainer.registerInstance('userModule', new UserModule());
    dependencyContainer.registerInstance('authModule', new AuthModule());
    dependencyContainer.registerInstance('postModule', new PostModule());
    dependencyContainer.registerInstance('subscrModule', new SubscriptionModule());
  }
}
export default AppModule;
