import express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';

const specs = YAML.load(__dirname + '/swagger.yaml');
const setupSwagger = (app: express.Application) => {
  app.use('/api', swaggerUi.serve, swaggerUi.setup(specs));
}
export default setupSwagger;
