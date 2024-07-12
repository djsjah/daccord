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
      await this.deleteAllNonVerifData();
    });
  }

  public async deleteAllNonVerifData(): Promise<void> {
    try {
      const { nonActivatedUsers, usersWithVerifToken } = await this.userService.getAllNonVerifUsers();
      const usersToDelete = this.getUsersToDelete(nonActivatedUsers);
      const usersToUpdate = this.getUsersToDelete(usersWithVerifToken);

      await Promise.all(usersToDelete.map(nonActivatedUser =>
        this.userService.deleteUser(nonActivatedUser)
      ));

      await Promise.all(usersToUpdate.map(userWithVerifToken =>
        this.userService.updateUser(userWithVerifToken, {
          verifToken: null
        }, false)
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
