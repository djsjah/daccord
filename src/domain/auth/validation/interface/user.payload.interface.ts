interface IUserPayload {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};
export default IUserPayload;
