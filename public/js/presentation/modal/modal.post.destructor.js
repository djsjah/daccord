import { removePostById, isStatusOk } from '../../api/api.js';

class PostDestructor {
  modal = document.querySelector('.modal_post_destructor');
  saveButton = this.modal.querySelector('.modal__button_save');
  closeModalButtonArray = this.modal.querySelectorAll('.modal__button_cancel');

  #modalUtils = null;
  #curPostId = null;

  constructor(modalUtils) {
    this.#modalUtils = modalUtils;
  }

  init() {
    this.saveButton.addEventListener('click', async () => {
      this.#modalUtils.startSavePreloader(this.saveButton);

      try {
        const removePostResponse = await removePostById(this.#curPostId);
        isStatusOk(removePostResponse);
      }
      catch (err) {
        await this.#modalUtils.endSavePreloader(this.saveButton);
        this.#modalUtils.setModalError(err);
        return;
      }

      await this.#modalUtils.endSavePreloader(this.saveButton);
      location.reload(true);
    });

    this.closeModalButtonArray.forEach((closeModalButton) => {
      closeModalButton.addEventListener('click', async () => {
        await this.#modalUtils.hideModal();
      });
    });
  }

  setupOpenButton(openModalButton, postId) {
    openModalButton.addEventListener('click', async () => {
      this.#curPostId = postId;
      await this.#modalUtils.showModal(this.modal);
    });
  }
}
export default PostDestructor;
