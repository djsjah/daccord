import { NextFunction, Request, Response } from 'express';

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  next();
};
export default authGuard;
