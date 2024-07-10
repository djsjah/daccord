interface IUserUpdateAuth {
  email?: string;
  isActivated?: boolean;
  refreshToken?: string | null;
  verifToken?: string | null;
};
export default IUserUpdateAuth;
