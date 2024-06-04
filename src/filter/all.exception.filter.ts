import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const logger = new Logger(AllExceptionsFilter.name);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let errorMessage = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorMessage = exception.message;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    };

    if (exception instanceof Error) {
      logger.error(
        `Error occurred: ${JSON.stringify(errorResponse)}`,
        exception.stack,
      );
    } else {
      logger.error(
        `Error occurred: ${JSON.stringify(errorResponse)}`,
        'Exception is not an instance of Error, stack trace is not available.',
      );
    }

    response.status(status).json(errorResponse);
  }
}
export default AllExceptionsFilter;
