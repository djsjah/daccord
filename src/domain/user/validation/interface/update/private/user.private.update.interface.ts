interface IUserPrivateUpdate {
  name?: string;
  role?: 'admin' | 'user';
  email?: string;
  password?: string;
  rating?: number;
};
export default IUserPrivateUpdate;
