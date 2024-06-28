interface IUserUpdate {
  name: string;
  role: 'admin' | 'user';
  email: string;
  password: string;
  isActivated: boolean;
  verifToken: string | null;
  rating: number;
};
export default IUserUpdate;
