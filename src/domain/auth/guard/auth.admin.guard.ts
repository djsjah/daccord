import { NextFunction, Request, Response } from 'express';

const authAdminGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).send("Unauthorized - you are not signed in as admin");
  }

  next();
};
export default authAdminGuard;
