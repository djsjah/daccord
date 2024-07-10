import { NextFunction, Request, Response } from 'express';
import dependencyContainer from '../../../../utils/lib/dependencyInjection/dependency.container';
import JWTStrategy from '../../../../utils/lib/jwt/jwt.strategy';
import refreshToken from '../auth.middleware';

const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accessToken = req.cookies['access-token'];

    if (!accessToken && req.cookies['refresh-token']) {
      accessToken = await refreshToken(req, res);
    }
    else if (!accessToken && !req.cookies['refresh-token']) {
      return res.status(401).send('Unauthorized - you are not signed in');
    }

    const userPayload = await dependencyContainer.getInstance<JWTStrategy>(
      'jwtStrategy'
    ).validateToken(accessToken);

    req.user = userPayload;
  }
  catch (err) {
    return res.status(401).send('Unauthorized - you are not signed in');
  }

  next();
};
export default authGuard;
