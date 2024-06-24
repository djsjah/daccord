import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): Response {
  let status = 500;
  let message = 'Internal Server Error';

  if (err instanceof HttpError) {
    status = err.statusCode;
    message = err.message;
  }

  console.log("ErrorHandler: ", err);

  return res.status(status).json({
    statusCode: status,
    message: message,
  });
}
export default errorHandler;
