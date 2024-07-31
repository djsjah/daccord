import express from 'express';
import dependencyContainer from './utils/lib/dependencyInjection/dependency.container';
import IUserPayload from './domain/auth/validation/interface/user.payload.interface';
import AppRouter from './app.routes';
import AuthRouter from './domain/auth/auth.routes';
import UserRouter from './domain/user/routes/user.routes';
import UserContactRouter from './domain/user/routes/user.contact.routes';
import PostRouter from './domain/post/post.routes';
import SubscriptionRouter from './domain/subscription/subscription.routes';
import PostService from './domain/post/post.service';
import ElasticSearchProvider from './utils/lib/elasticsearch/elasticsearch.provider';

declare module 'express' {
  interface Request {
    user?: IUserPayload;
  }
}

export const appConfig = () => ({
  port: parseInt(process.env.PORT as string, 10) || 3000
});

export function setupCurURL(port: number): void {
  process.env.CUR_URL = process.env.NODE_ENV === 'development' ?
    `${process.env.URL_DEV}:${port}` : process.env.URL_PROD;
}

export function useRoutes(app: express.Application): void {
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
}

export async function setupElasticSearch() {
  const postService = dependencyContainer.getInstance<PostService>('postService');
  const esProvider = dependencyContainer.getInstance<ElasticSearchProvider>('esProvider');

  const postIndex = postService.getEsIndex();
  const isPostIndexExist = await esProvider.isIndexExist(postIndex);

  if (!isPostIndexExist) {
    await esProvider.createIndex({
      index: postIndex,
      mappings: {
        properties: {
          id: {
            type: 'keyword'
          },
          title: {
            type: 'text',
            analyzer: 'russian'
          },
          content: {
            type: 'text',
            analyzer: 'russian'
          },
          authorId: {
            type: 'keyword'
          }
        }
      }
    });

    const docs: object[] = [];
    const posts = await postService.getAllUserPosts({});

    posts.forEach(post => {
      docs.push({
        index: {
          _index: postIndex,
          _id: post.id
        }
      });
      docs.push({
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId
      });
    });

    await esProvider.populateIndex(docs);
  }
}

