import { cloneNodeFromTemplate } from '../../helpers/helpers.js';

class ModalUtils {
  decoratorModal = document.querySelector('.decorator_modal');
  disabledBlock = document.querySelector('.disabled-block');
  #curModal = null;

  init() {
    document.addEventListener('mouseup', (ev) => {
      if (this.#curModal && !this.#curModal.contains(ev.target) && ev.target !== this.disabledBlock) {
        this.hideModal();
      }
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === "Escape" && this.#curModal && ev.target !== this.disabledBlock) {
        this.hideModal();
      }
    });
  }

  async showModal(modal) {
    this.#curModal = modal;
    await this.#toggleAppearAnim();
  }

  async hideModal() {
    await this.#toggleAppearAnim();
    this.#curModal = null;
  }

  async startSavePreloader(modalSaveButton) {
    modalSaveButton.append(cloneNodeFromTemplate(
      document.querySelector('.preloader-template_save')
    ));

    modalSaveButton.insertBefore(modalSaveButton.lastElementChild, modalSaveButton.firstElementChild);

    this.disabledBlock.classList.remove('display-none');
    modalSaveButton.classList.add('modal__button_load');
    modalSaveButton.firstElementChild.classList.add('rotate-anim');
  }

  async endSavePreloader(modalSaveButton) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(modalSaveButton.firstElementChild.remove());
      }, 1700);
    });

    this.disabledBlock.classList.add('display-none');
    modalSaveButton.classList.remove('modal__button_load');
  }

  setModalError(error) {
    const modalFoot = this.#curModal.querySelector('.modal__foot');
    const modalError = this.#curModal.querySelector('.modal__error');

    modalError.textContent = error;
    modalFoot.classList.add('modal__foot_error');
    modalError.classList.remove('display-none');
  }

  async #toggleAppearAnim() {
    if (this.#curModal.classList.contains('modal-appear-anim')) {
      this.decoratorModal.classList.remove('appear-anim');
      this.decoratorModal.classList.add('hide-anim');

      this.#curModal.classList.remove('modal-appear-anim');
      this.#curModal.classList.add('hide-anim');

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.decoratorModal.classList.remove('hide-anim'));
        }, 300);
      });

      this.decoratorModal.classList.add('display-none');
      this.#curModal.classList.remove('hide-anim');
      this.#curModal.classList.add('display-none');
    }
    else {
      this.decoratorModal.classList.remove('display-none');
      this.decoratorModal.classList.add('appear-anim');

      this.#curModal.classList.remove('display-none');
      this.#curModal.classList.add('modal-appear-anim');
    }
  }
}
export default ModalUtils;
