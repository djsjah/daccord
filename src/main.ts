import express from 'express';
import cors from 'cors';
import config from './app.config';
import AppModule from './app.module';
import userRouter from './domain/user/user.controller';
import postRouter from './domain/post/post.controller';
import setupSwagger from './swagger/swagger.config';
import errorHandler from './middleware/error/error.middleware';

async function bootstrap() {
  await AppModule.load();

  const app = express();
  const { port } = config();

  process.env.CUR_URL = process.env.NODE_ENV === 'development' ?
    `${process.env.URL_DEV}:${port}` : process.env.URL_PROD;

  app.use(express.json());
  app.use('/api/users', userRouter);
  app.use('/api/posts', postRouter);

  setupSwagger(app);

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server running on ${process.env.CUR_URL} - ${process.env.NODE_ENV}`);
  });
}

bootstrap();
