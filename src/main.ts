import {
  appConfig,
  useRoutes,
  setupCurURL
} from './app.config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dependencyContainer from './utils/lib/dependencyInjection/dependency.container';
import AppModule from './app.module';
import AuthService from './domain/auth/auth.service';
import setupSwagger from './middleware/swagger/swagger.config';
import errorHandler from './middleware/handler/error.handler';

async function bootstrap() {
  const appModule = new AppModule();
  dependencyContainer.registerInstance('appModule', new AppModule());
  await appModule.load();

  const app = express();
  const { port } = appConfig();
  setupCurURL(port);

  const authService = dependencyContainer.getInstance<AuthService>('authService');
  await authService.deleteAllNonVerifData();
  authService.scheduleDailyCleanupNotVerifData();

  app.use(cookieParser());
  app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
  }));
  app.use(express.json());

  useRoutes(app);
  setupSwagger(app);

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server running on ${process.env.CUR_URL} - ${process.env.NODE_ENV}`);
  });
}

bootstrap();
