import express from 'express';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dependencyContainer from './dependencyInjection/dependency.container';
import config from './app.config';
import AppModule from './app.module';
import AppRouter from './app.routes';
import AuthRouter from './auth/auth.routes';
import UserRouter from './domain/user/user.routes';
import PostRouter from './domain/post/post.routes';
import setupSwagger from './swagger/swagger.config';
import errorHandler from './middleware/error/error.middleware';

async function bootstrap() {
  const appModule = new AppModule();
  dependencyContainer.registerInstance('appModule', new AppModule());
  await appModule.load();

  const app = express();
  const { port } = config();

  process.env.CUR_URL = process.env.NODE_ENV === 'development' ?
    `${process.env.URL_DEV}:${port}` : process.env.URL_PROD;

  app.use(session({
    secret: process.env.SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7200000
    }
  }));
  app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use('/', dependencyContainer.getInstance<AppRouter>('appRouter').getAppRouter());
  app.use('/auth', dependencyContainer.getInstance<AuthRouter>('authRouter').getAuthRouter());
  app.use('/api/users', dependencyContainer.getInstance<UserRouter>('userRouter').getUserRouter());
  app.use('/api/posts', dependencyContainer.getInstance<PostRouter>('postRouter').getPostRouter());

  setupSwagger(app);

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server running on ${process.env.CUR_URL} - ${process.env.NODE_ENV}`);
  });
}

bootstrap();
