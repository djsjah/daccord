interface IUserUpdate {
  name: string;
  role: 'admin' | 'user';
  email: string;
  password: string;
  isActivated: true;
  rating: number;
};
export default IUserUpdate;
