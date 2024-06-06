import dotenv from 'dotenv';
import DatabaseModule from './database/database.module';
import User from './database/schema/user/user.model';
import UserContact from './database/schema/user/user.contact.model';
import Post from './database/schema/post/post.model';
import Subscription from './database/schema/subscription/subscription.model';

class AppModule {
  public static async load(): Promise<void> {
    dotenv.config();
    const dbModule = new DatabaseModule(
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
    );

    await dbModule.onModuleInit();
  }
}
export default AppModule;
