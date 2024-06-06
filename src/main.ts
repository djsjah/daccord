import express from 'express';
import config from './app.config';
import AppModule from './app.module';

async function bootstrap() {
  await AppModule.load();

  const app = express();
  const { port } = config();

  process.env.CUR_URL = process.env.NODE_ENV === 'development' ?
    `${process.env.URL_DEV}:${port}` : process.env.URL_PROD;

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Server running on ${process.env.CUR_URL} - ${process.env.NODE_ENV}`);
  });
}

bootstrap();
