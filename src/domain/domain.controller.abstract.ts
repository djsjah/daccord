import { Request, Response, NextFunction } from 'express';

abstract class DomainController {
  public abstract verifyUserEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
export default DomainController;
