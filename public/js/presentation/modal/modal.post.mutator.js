import { getDataFromForm } from '../../helpers/helpers.js';
import { createPost, updatePostById, isStatusOk } from '../../api/api.js';

class PostMutator {
  modal = document.querySelector('.modal_post_mutator');

  modalTitle = this.modal.querySelector('.modal__title');
  modalId = this.modal.querySelector('.modal__id_value');
  modalInput = this.modal.querySelector('.modal__input_mutator');
  modalTextarea = this.modal.querySelector('.modal__input_textarea');

  saveButton = this.modal.querySelector('.modal__button_save');
  modalForm = this.modal.querySelector('.modal__body_form');
  closeModalButtonArray = this.modal.querySelectorAll('.modal__button_cancel');

  #modalUtils = null;
  #curPost = null;

  constructor(modalUtils) {
    this.#modalUtils = modalUtils;
  }

  init() {
    this.modalForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      this.#modalUtils.startSavePreloader(this.saveButton);

      try {
        let mutateResponse = null;

        if (this.#curPost.addNewRevision) {
          mutateResponse = await createPost(getDataFromForm(this.modalForm), this.#curPost.id);
        }
        else {
          mutateResponse = await updatePostById(this.#curPost.id, getDataFromForm(this.modalForm));
        }

        isStatusOk(mutateResponse);
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

  setupOpenButton(openModalButton, post, addNewRevision = false) {
    openModalButton.addEventListener('click', async () => {
      this.modalId.textContent = post.id;
      this.modalInput.value = post.title;
      this.modalTextarea.textContent = post.content;

      this.#curPost = post;
      if (addNewRevision) {
        this.modalTitle.textContent = 'Добавить ревизию';
        this.#curPost.addNewRevision = true;
      }
      else {
        this.modalTitle.textContent = 'Изменить пост';
      }

      await this.#modalUtils.showModal(this.modal);
    });
  }
}
export default PostMutator;
