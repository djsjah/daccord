import dotenv from 'dotenv';
import dependencyContainer from './dependencyInjection/dependency.container';
import SequelizeModule from './sequelize/sequelize.module';
import AppRouter from './app.routes';
import AppController from './app.controller';
import MailerModule from './mailer/mailer.module';
import CryptoModule from './crypto/crypto.module';
import UserModule from './domain/user/user.module';
import AuthModule from './auth/auth.module';
import PostModule from './domain/post/post.module';
import User from './models/user/user.model';
import UserContact from './models/user/user.contact.model';
import Post from './models/post/post.model';
import Subscription from './models/subscription/subscription.model';

class AppModule {
  public async load(): Promise<void> {
    dotenv.config();

    dependencyContainer.registerInstance('seqModule', new SequelizeModule(
      {
        dialect: 'postgres',
        host: process.env.DATABASE_HOST_DEV!,
        port: Number(process.env.DATABASE_PORT_DEV!),
        username: process.env.DATABASE_USERNAME_DEV!,
        password: process.env.DATABASE_PASSWORD_DEV!,
        database: process.env.DATABASE_NAME_DEV!
      },
      [
        User,
        UserContact,
        Post,
        Subscription
      ]
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
    dependencyContainer.registerInstance('userModule', new UserModule());
    dependencyContainer.registerInstance('authModule', new AuthModule({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 300000
    }));
    dependencyContainer.registerInstance('postModule', new PostModule());
  }
}
export default AppModule;
