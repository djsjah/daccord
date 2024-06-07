import UserService from './user.service';

class UserModule {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getUserServiceSingleton(): UserService {
    return this.userService;
  }
}

const userModule = new UserModule();
export default userModule;
