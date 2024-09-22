import { cloneNodeFromTemplate, formatDate } from '../../helpers/helpers.js';
import { getAllPosts, isStatusOk } from '../../api/api.js';

class Post {
  postMainBlock = document.querySelector('.post__block_main');
  postTemplateWarn = document.querySelector('.post-template_warn');
  postListTemplate = document.querySelector('.post-template_list');
  postItemTemplate = document.querySelector('.post-template_item');

  #posts = null;
  #postWarn = null;

  #userAuth = null;
  #postMutator = null;
  #postDestructor = null;

  constructor(userAuth, postMutator, postDestructor) {
    this.#userAuth = userAuth;
    this.#postMutator = postMutator;
    this.#postDestructor = postDestructor;
  }

  async init() {
    this.postMainBlock.append(cloneNodeFromTemplate(this.postTemplateWarn));
    this.#postWarn = document.querySelector('.post__warn');
    this.#postWarn.classList.add('display-none');

    if (!this.#userAuth.getAuthData()) {
      this.#postWarn.classList.remove('display-none');
      return;
    }

    try {
      const getPostsRequest = await getAllPosts();
      isStatusOk(getPostsRequest);
      this.#posts = (await getPostsRequest.json()).data;
    }
    catch (err) {
      this.#postWarn.classList.remove('display-none');
      this.#postWarn.textContent = err;

      console.log(err);
      return;
    }

    this.postMainBlock.append(cloneNodeFromTemplate(this.postListTemplate));
    const postList = document.querySelector('.post__list_main');

    this.#posts.forEach(post => {
      postList.append(cloneNodeFromTemplate(this.postItemTemplate));
      const postItem = postList.querySelector('.post__review:last-child');

      postItem.querySelector('.post__id').textContent = post.id;
      postItem.querySelector('.post__title_main').textContent = post.title;
      postItem.querySelector('.post__date_created').textContent = formatDate(new Date(post.createdAt));
      postItem.querySelector('.post__date_updated').textContent = formatDate(new Date(post.updatedAt));
      postItem.querySelector('.post__content').textContent = post.content;

      if (this.#userAuth.getAuthData().role === 'admin') {
        postItem.querySelector('.post__wrapper_author').classList.remove('display-none');
        postItem.querySelector('.post__id_author').textContent = post.authorId;
      }

      this.#postMutator.setupOpenButton(postItem.querySelector('.post__button_update'), post);
      this.#postMutator.setupOpenButton(postItem.querySelector('.post__button_revision_add'), post, true);
      this.#postDestructor.setupOpenButton(postItem.querySelector('.post__button_remove'), post.id);

      const showHistoryButton = postItem.querySelector('.post__button_revision_history');
      showHistoryButton.href += `?post=${encodeURIComponent(JSON.stringify(post))}`;
    });
  }
}
export default Post;
