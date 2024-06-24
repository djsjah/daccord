import cron from 'node-cron';
import UserService from '../user/service/user.service';

class AuthService {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public scheduleDailyCleanup() {
    cron.schedule('0 0 * * *', () => {
      this.deleteAllNonActivatedAccounts();
    });
  }

  public async deleteAllNonActivatedAccounts() {
    try {
      const nonActivatedUsers = await this.userService.getAllNonActivatedUsers();
      if (nonActivatedUsers.length > 0) {
        await Promise.all(nonActivatedUsers.map(nonActivatedUser =>
          this.userService.deleteUserById(nonActivatedUser.id)
        ));
      }
    }
    catch (err) {
      console.log(err);
    }
  }
}
export default AuthService;
