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
      const currentDate = new Date();

      const usersToDelete = nonActivatedUsers.filter(nonActivatedUser => {
        const createdAtDate = new Date(nonActivatedUser.createdAt);
        const diffInHours = Math.abs(currentDate.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60);
        return diffInHours > 3;
      });

      await Promise.all(usersToDelete.map(nonActivatedUser =>
        this.userService.deleteUserById(nonActivatedUser.id)
      ));
    }
    catch (err) {
      console.log(err);
    }
  }
}
export default AuthService;
