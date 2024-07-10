import { NextFunction, Request, Response } from 'express';
import authGuard from './auth.guard';

const authAdminGuard = async (req: Request, res: Response, next: NextFunction) => {
  authGuard(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(401).send("Unauthorized - you are not signed in as admin");
    }
  });

  next();
};
export default authAdminGuard;
