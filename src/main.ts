import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import AppModule from './app.module';
import AllExceptionsFilter from './filter/all.exception.filter';
import ValidationExceptionFilter from './filter/validation.exception.filter';
import NotFoundExceptionFilter from './filter/found.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  if (process.env.SERVER_DESCR === 'Local') {
    process.env.SERVER_URL += `:${port}`;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('REST API для базы данных пользователей и их постов')
    .setDescription('API для управления пользователями и их постами')
    .setVersion('1.0')
    .addTag('users')
    .addTag('posts')
    .addServer(process.env.SERVER_URL, process.env.SERVER_DESCR)
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, swaggerDocument);
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new ValidationExceptionFilter(),
    new NotFoundExceptionFilter()
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(port);
}

bootstrap();
