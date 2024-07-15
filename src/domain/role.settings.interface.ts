import { FindOptions } from 'sequelize';

interface IRoleSettings {
  [key: string]: Partial<FindOptions>;
}
export default IRoleSettings;
