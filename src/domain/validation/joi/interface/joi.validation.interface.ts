import { Request } from 'express';

interface IJoiRequestValidation {
  type: keyof Pick<Request, 'body' | 'params' | 'query'>;
  name?: string;
};
export default IJoiRequestValidation;
