import { getDataFromForm } from '../../helpers/helpers.js';
import { getUserPosts, isStatusOk } from '../../api/api.constructor.js';

const POST_SEARCH_DATA = [
  'id',
  'title',
  'content',
  'authorId',
  'message'
];

export function PostSearch() {
  const postSearchForm = document.querySelector('.post__form');
  const postSearchInspector = document.querySelector('.post__inspector');
  const postReviewElem = document.querySelector('.post__code');

  postSearchForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const postSearchData = getDataFromForm(postSearchForm);
    const filters =
      `filters[${postSearchData.searchParams}][${postSearchData.searchMethods}]=${postSearchData.searchRequest}`;
    let posts = null;

    try {
      const getPostsResponse = await getUserPosts(filters);
      postSearchInspector.classList.remove('display-none');

      if (getPostsResponse.status === 401) {
        postReviewElem.textContent = "Сначала вы должны авторизоваться в системе";
      }

      isStatusOk(getPostsResponse);
      posts = await getPostsResponse.json();
    }
    catch (err) {
      console.log(err);
      postReviewElem.textContent = `${postReviewElem.textContent} (${err})`;
      return;
    }

    postReviewElem.innerHTML = JSON.stringify(posts, (key, value) => {
      if (key === 'status') {
        value = `<span class=post__status>${value}</span>`;
      }
      else if (POST_SEARCH_DATA.includes(key)) {
        value = `<span class=post__data>${value}</span>`;
      }

      return value;
    }, 2);
  });
}
