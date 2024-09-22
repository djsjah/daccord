import { isStatusOk, getAllPosts, updatePostById } from '../../api/api.js';
import { cloneNodeFromTemplate, formatDate } from '../../helpers/helpers.js';

class PostHistory {
  postList = document.querySelector('.post__list_main');
  postItemTemplate = document.querySelector('.post-template_item');
  postMainFlagTemplate = document.querySelector('.post-template_flag_main_revision');
  postSwitchRevisionTemplate = document.querySelector('.post-template_button_revision_switch');

  #userAuth = null;
  #postMutator = null;
  #postDestructor = null;

  #mainPostIndex = null;
  #posts = null;

  constructor(userAuth, postMutator, postDestructor) {
    this.#userAuth = userAuth;
    this.#postMutator = postMutator;
    this.#postDestructor = postDestructor;
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const mainRevision = JSON.parse(urlParams.get('post'));

    if (mainRevision.revisionGroupId) {
      try {
        const getRevisionsRequest = await getAllPosts(
          `filters[revisionGroupId]=${mainRevision.revisionGroupId}`
        );
        isStatusOk(getRevisionsRequest);
        this.#posts = (await getRevisionsRequest.json()).data;
      }
      catch (err) {
        console.log(err);
        return;
      }
    }
    else {
      this.#posts = [mainRevision];
    }

    this.#posts.forEach(post => {
      this.postList.append(cloneNodeFromTemplate(this.postItemTemplate));
      const postItem = this.postList.querySelector('.post__review:last-child');
      const postFooter = postItem.querySelector('.post__footer');

      if (post.isMainRevision) {
        const postArticle = postItem.querySelector('.post__article');
        postItem.classList.add('post__review_main');
        postArticle.classList.add('post__article_main');
        postFooter.append(cloneNodeFromTemplate(this.postMainFlagTemplate));

        this.#mainPostIndex = this.postList.children.length - 1;
      }
      else {
        postFooter.append(cloneNodeFromTemplate(this.postSwitchRevisionTemplate));
        const switchToRevisionButton = postItem.querySelector('.post__button_revision_switch');

        switchToRevisionButton.addEventListener('click', async () => {
          try {
            const switchToRevisionResponse = await updatePostById(post.id, {
              isMainRevision: true
            });

            isStatusOk(switchToRevisionResponse);
          }
          catch (err) {
            console.log(err);
            return;
          }

          location.reload(true);
        });
      }

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
      this.#postDestructor.setupOpenButton(postItem.querySelector('.post__button_remove'), post.id);
    });

    if (this.#mainPostIndex !== 0) {
      this.postList.insertBefore(this.postList.children[this.#mainPostIndex], this.postList.children[0]);
    }
  }
}
export default PostHistory;
