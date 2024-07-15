import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

function ValidateReqParam(reqParam: string, validateSchema: Schema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: [ Request, Response, NextFunction ]) {
      const param = args[0].params[reqParam];
      const { error } = validateSchema.validate(param);

      if (error) {
        return args[1].status(422).send(`Validation error: ${error.details[0].message}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
export default ValidateReqParam;
