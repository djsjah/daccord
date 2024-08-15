import {
  getAllUsers,
  getUserPosts,
  isStatusOk
} from './api.constructor.js';

export function ApiTester() {
  const getAllUsersButton = document.querySelector('.api-test__button_get_all_users');
  const getAllUserPostsButton = document.querySelector('.api-test__button_get_user_posts');

  getAllUsersButton.addEventListener('click', async () => {
    try {
      const getUsersResponse = await getAllUsers();
      console.log("\n\nПопытка получить всех пользователей (http://localhost:5000/api/users/admin): ", getUsersResponse);
      isStatusOk(getUsersResponse);

      const users = await getUsersResponse.json();
      console.log("\nДанные ответа (запрос - http://localhost:5000/api/users/admin): ", users);
    }
    catch (err) {
      console.log(err);
    }
  });

  getAllUserPostsButton.addEventListener('click', async () => {
    try {
      const getPostsResponse = await getUserPosts();
      console.log("\n\nПопытка получить все свои посты (http://localhost:5000/api/posts/public): ", getPostsResponse);
      isStatusOk(getPostsResponse);

      const posts = await getPostsResponse.json();
      console.log("\nДанные ответа (запрос - http://localhost:5000/api/posts/public): ", posts);
    }
    catch (err) {
      console.log(err);
    }
  });
}
