interface ISequelizeService {
  syncWithDb(): Promise<void>;
}
export default ISequelizeService;
