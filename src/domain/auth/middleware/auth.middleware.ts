import { Request, Response } from 'express';
import dependencyContainer from '../../../utils/lib/dependencyInjection/dependency.container';
import UserService from '../../user/service/user.service';
import JWTStrategy from '../../../utils/lib/jwt/jwt.strategy';

const refreshToken = async (req: Request, res: Response) => {
  const userService = dependencyContainer.getInstance<UserService>('userService');
  await userService.getUserByUniqueParams({
    refreshToken: req.cookies['refresh-token']
  });

  const jwtStrategy = dependencyContainer.getInstance<JWTStrategy>('jwtStrategy');
  const userPayload = await jwtStrategy.validateToken(req.cookies['refresh-token']);
  const accessToken = jwtStrategy.createJWTToken({
    id: userPayload.id,
    name: userPayload.name,
    email: userPayload.email,
    role: userPayload.role
  });

  res.cookie('access-token', accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: 900000
  });

  return accessToken;
};
export default refreshToken;
