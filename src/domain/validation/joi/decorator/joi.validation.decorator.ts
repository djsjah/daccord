import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import IJoiValidation from '../interface/joi.validation.interface';
import joiValidation from '../joi.validation';

function JoiRequestValidation(options: IJoiValidation, schema: Schema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: [Request, Response, NextFunction]) {
      const value = options.name ?
        args[0][options.type][options.name] : args[0][options.type];

      const validError = joiValidation(value, schema);
      if (validError) {
        return args[1].status(422).send(validError);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
export default JoiRequestValidation;
