import { ModalModule } from './js/presentation/modal/modal.module.js';
import { AuthModule } from './js/presentation/auth/auth.module.js';
import { PostSearch } from './js/presentation/post/post.search.js';
import { ApiTester } from './js/api/api.tester.js';
import {
  getUserAuthData,
  isStatusOk
} from './js/api/api.constructor.js';

async function main() {
  let userData = null;

  try {
    const authResponse = await getUserAuthData();
    console.log("Попытка получить данные пользователя (http://localhost:5000/auth): ", authResponse);
    isStatusOk(authResponse);

    userData = await authResponse.json();
    console.log("\nДанные ответа (запрос - http://localhost:5000/auth): ", userData);
  }
  catch (err) {
    console.log(err);
  }

  AuthModule(userData);
  ModalModule();
  PostSearch();
  ApiTester();
}

main();
