import dotenv from 'dotenv';
import dependencyContainer from './utils/lib/dependencyInjection/dependency.container';
import AppRouter from './app.routes';
import AppController from './app.controller';
import DatabaseModule from './database/database.module';
import MailerModule from './utils/lib/mailer/mailer.module';
import CryptoModule from './utils/lib/crypto/crypto.module';
import JWTModule from './utils/lib/jwt/jwt.module';
import UserModule from './domain/user/user.module';
import AuthModule from './domain/auth/auth.module';
import PostModule from './domain/post/post.module';
import SubscriptionModule from './domain/subscription/subscription.module';

class AppModule {
  public async load(): Promise<void> {
    dotenv.config();

    dependencyContainer.registerInstance('dbModule', new DatabaseModule());
    await dependencyContainer.getInstance<DatabaseModule>('dbModule').onModuleInit();

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
    dependencyContainer.registerInstance('jwtModule', new JWTModule());
    dependencyContainer.registerInstance('userModule', new UserModule());
    dependencyContainer.registerInstance('authModule', new AuthModule());
    dependencyContainer.registerInstance('postModule', new PostModule());
    dependencyContainer.registerInstance('subscrModule', new SubscriptionModule());
  }
}
export default AppModule;
