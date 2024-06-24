interface IDialectService {
  createDbIfNotExists(): Promise<void>;
};
export default IDialectService;
