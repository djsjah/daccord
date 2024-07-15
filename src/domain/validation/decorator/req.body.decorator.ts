import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

function ValidateReqBody(validateSchema: ObjectSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: [ Request, Response, NextFunction ]) {
      const reqBody = args[0].body;
      const { error } = validateSchema.validate(reqBody);

      if (error) {
        return args[1].status(422).send(`Validation error: ${error.details[0].message}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
export default ValidateReqBody;
