import {
  convertResponseToJson,
  getAllUsers,
  getUserPosts,
  isStatusOk
} from '../../data/api/api.constructor.js';

export function ApiTester() {
  const getAllUsersButton = document.querySelector('.api-test__button_get_all_users');
  const getAllUserPostsButton = document.querySelector('.api-test__button_get_user_posts');

  getAllUsersButton.addEventListener('click', async () => {
    try {
      const response = await getAllUsers();
      console.log("\n\nПопытка получить всех пользователей (http://localhost:5000/api/users/admin): ", response);
      isStatusOk(response);

      const data = await convertResponseToJson(response);
      console.log("\nДанные ответа (запрос - http://localhost:5000/api/users/admin): ", data);
    }
    catch (err) {
      console.log(err);
    }
  });

  getAllUserPostsButton.addEventListener('click', async () => {
    try {
      const response = await getUserPosts();
      console.log("\n\nПопытка получить все свои посты (http://localhost:5000/api/posts/public): ", response);
      isStatusOk(response);

      const data = await convertResponseToJson(response);
      console.log("\nДанные ответа (запрос - http://localhost:5000/api/posts/public): ", data);
    }
    catch (err) {
      console.log(err);
    }
  });
}
