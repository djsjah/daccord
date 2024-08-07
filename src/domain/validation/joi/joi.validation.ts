import { Schema } from 'joi';

function joiValidation(value: any, schema: Schema): void | string {
  const { error } = schema.validate(value);
  if (error) {
    return `Validation error: ${error.details[0].message}`;
  }
}
export default joiValidation;
