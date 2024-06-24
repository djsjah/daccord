import express from 'express';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dependencyContainer from './utils/lib/dependencyInjection/dependency.container';
import config from './app.config';
import AppModule from './app.module';
import AppRouter from './app.routes';
import AuthRouter from './domain/auth/auth.routes';
import AuthService from './domain/auth/auth.service';
import UserRouter from './domain/user/router/user.routes';
import UserContactRouter from './domain/user/router/user.contact.routes';
import PostRouter from './domain/post/post.routes';
import SubscriptionRouter from './domain/subscription/subscription.routes';
import setupSwagger from './middleware/swagger/swagger.config';
import errorHandler from './middleware/handler/error.handler';

async function bootstrap() {
  const appModule = new AppModule();
  dependencyContainer.registerInstance('appModule', new AppModule());
  await appModule.load();

  const app = express();
  const { port } = config();
  const authService = dependencyContainer.getInstance<AuthService>('authService');

  await authService.deleteAllNonActivatedAccounts();
  authService.scheduleDailyCleanup();

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

  app.use('/', dependencyContainer.getInstance<AppRouter>('appRouter').getRouter());
  app.use('/auth', dependencyContainer.getInstance<AuthRouter>('authRouter').getRouter());
  app.use('/api/users', dependencyContainer.getInstance<UserRouter>('userRouter').getRouter());
  app.use(
    '/api/users/contacts',
    dependencyContainer.getInstance<UserContactRouter>('userContactRouter').getRouter()
  );
  app.use('/api/posts', dependencyContainer.getInstance<PostRouter>('postRouter').getRouter());
  app.use(
    '/api/subscriptions',
    dependencyContainer.getInstance<SubscriptionRouter>('subscrRouter').getRouter()
  );

  setupSwagger(app);

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server running on ${process.env.CUR_URL} - ${process.env.NODE_ENV}`);
  });
}

bootstrap();
