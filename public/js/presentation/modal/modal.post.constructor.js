import { getDataFromForm } from '../../helpers/helpers.js';
import { createPost, isStatusOk } from '../../api/api.js';

class PostConstructor {
  modal = document.querySelector('.modal_post_constructor');
  openModalButton = document.querySelector('.post__button_create');
  modalForm = this.modal.querySelector('.modal__body_form');
  saveButton = this.modal.querySelector('.modal__button_save');
  closeModalButtonArray = this.modal.querySelectorAll('.modal__button_cancel');

  #modalUtils = null;

  constructor(modalUtils) {
    this.#modalUtils = modalUtils;
  }

  init() {
    this.openModalButton.addEventListener('click', async () => {
      await this.#modalUtils.showModal(this.modal);
    });

    this.modalForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      this.#modalUtils.startSavePreloader(this.saveButton);

      try {
        const createPostResponse = await createPost(getDataFromForm(this.modalForm));
        isStatusOk(createPostResponse);
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
        this.modalForm.reset();
      });
    });
  }
}
export default PostConstructor;
