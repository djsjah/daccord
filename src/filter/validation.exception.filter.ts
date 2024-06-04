import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const excMessage = exception.getResponse() as any;

    let formattedErrors = [];
    if (Array.isArray(excMessage.message)) {
      formattedErrors = excMessage.message.map((error) => ({
        field: error.field,
        message: error.message,
      }));
    } else {
      formattedErrors = [
        {
          field: 'general',
          message: excMessage.message,
        },
      ];
    }

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
}
export default ValidationExceptionFilter;
