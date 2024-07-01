import cron from 'node-cron';
import User from '../../database/models/user/user.model';
import UserService from '../user/service/user.service';

class AuthService {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public scheduleDailyCleanupNotVerifData() {
    cron.schedule('0 0 * * *', async () => {
      await this.deleteAllNonActivatedAccounts();
      await this.deleteAllVerificationTokens();
    });
  }

  public async deleteAllNonActivatedAccounts(): Promise<void> {
    try {
      const nonActivatedUsers = await this.userService.getAllNonActivatedUsers();
      const usersToDelete = this.getUsersToDelete(nonActivatedUsers);

      await Promise.all(usersToDelete.map(nonActivatedUser =>
        this.userService.deleteUser(nonActivatedUser)
      ));
    }
    catch (err) {
      console.log(err);
    }
  }

  public async deleteAllVerificationTokens(): Promise<void> {
    try {
      const usersWithVerifToken = await this.userService.getAllUsersWithVerifToken();
      const usersToDelete = this.getUsersToDelete(usersWithVerifToken);

      await Promise.all(usersToDelete.map(userWithVerifToken =>
        this.userService.updateUserAuthData(userWithVerifToken, {
          verifToken: null
        })
      ));
    }
    catch (err) {
      console.log(err);
    }
  }

  public getUsersToDelete(users: User[]): User[] {
    const currentDate = new Date();

    return (
      users.filter(user => {
        const userUpdatedAtDate = new Date(user.updatedAt);
        const diffInHours = Math.abs(currentDate.getTime() - userUpdatedAtDate.getTime()) / (1000 * 60 * 60);
        return diffInHours > 3;
      })
    );
  }
}
export default AuthService;
