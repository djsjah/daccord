import User from './database/models/user/user.model';

declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}

export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3000
});
