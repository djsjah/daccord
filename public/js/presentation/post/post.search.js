import { getDataFromForm } from '../../helpers/helpers.js';
import { getAllPosts, isStatusOk } from '../../api/api.js';

class PostSearch {
  #postSearchForm = document.querySelector('.post__form');
  #postSearchInspector = document.querySelector('.post__inspector');
  #postReviewElem = document.querySelector('.post__code');

  #posts = null;
  #postData = [
    'id',
    'title',
    'content',
    'authorId',
    'message'
  ];

  init() {
    this.#postSearchForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const postSearchData = getDataFromForm(this.#postSearchForm);
      const filters =
        `filters[${postSearchData.searchParams}][${postSearchData.searchMethods}]=${postSearchData.searchRequest}`;

      try {
        const getPostsResponse = await getAllPosts(filters);
        this.#postSearchInspector.classList.remove('display-none');

        if (getPostsResponse.status === 401) {
          this.#postReviewElem.textContent = "Сначала вы должны авторизоваться в системе";
        }

        isStatusOk(getPostsResponse);
        this.#posts = await getPostsResponse.json();
      }
      catch (err) {
        console.log(err);
        this.#postReviewElem.textContent = `${err}`;
        return;
      }

      this.#postReviewElem.innerHTML = JSON.stringify(this.#posts, (key, value) => {
        if (key === 'status') {
          value = `<span class=post__status>${value}</span>`;
        }
        else if (this.#postData.includes(key)) {
          value = `<span class=post__data>${value}</span>`;
        }

        return value;
      }, 2);
    });
  }
}
export default PostSearch;
