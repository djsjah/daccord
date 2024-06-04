import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_FILTER } from '@nestjs/core';
import AppController from './app.controller';
import AppService from './app.service';
import config from './app.config';
import UserModule from './domain/user/user.module';
import PostModule from './domain/post/post.module';
import UserModel from './database/schema/user/user.model';
import UserContactModel from './database/schema/user/user.contact.model';
import PostModel from './database/schema/post/post.model';
import SubscriptionModel from './database/schema/subscription/subscription.model';
import AllExceptionsFilter from './filter/all.exception.filter';
import ValidationExceptionFilter from './filter/validation.exception.filter';
import NotFoundExceptionFilter from './filter/found.exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config]
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      models: [UserModel, UserContactModel, PostModel, SubscriptionModel],
      autoLoadModels: true
    }),
    UserModule,
    PostModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter
    }
  ],
})
export default class AppModule { }
