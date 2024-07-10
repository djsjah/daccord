import jwt, { Secret } from 'jsonwebtoken';
import { Unauthorized } from 'http-errors';
import IUserPayload from '../../../domain/auth/validation/interface/user.payload.interface';

class JWTStrategy {
  private readonly secretKey: Secret = process.env.JWT_SECRET!;

  public createAccessToken(userPayload: IUserPayload) {
    return jwt.sign(userPayload, this.secretKey, { expiresIn: '15m'});
  }

  public createRefreshToken(userPayload: IUserPayload) {
    return jwt.sign(userPayload, this.secretKey, { expiresIn: '3d'});
  }

  public validateToken(token: string): Promise<IUserPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secretKey, (err, decoded) => {
        if (err) {
          reject(new Unauthorized("Unauthorized - you are not signed in"));
        }
        else {
          resolve(decoded as IUserPayload);
        }
      })
    });
  }
}
export default JWTStrategy;
