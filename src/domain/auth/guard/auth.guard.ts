import { NextFunction, Request, Response } from 'express';

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized - you are not signed in');
  }

  next();
};
export default authGuard;
