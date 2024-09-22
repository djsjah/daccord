import { getDataFromForm } from '../../helpers/helpers.js';
import { signin, isStatusOk } from '../../api/api.js';

class ModalAuth {
  modal = document.querySelector('.modal_auth');
  openModalButton = document.querySelector('.header__link_auth');
  authButton = this.modal.querySelector('.modal__button_save');
  modalForm = this.modal.querySelector('.modal__body_form');
  closeModalButtonArray = this.modal.querySelectorAll('.modal__button_cancel');

  #modalUtils = null;
  #userAuth = null;

  constructor(userAuth, modalUtils) {
    this.#modalUtils = modalUtils;
    this.#userAuth = userAuth;
  }

  init() {
    if (this.#userAuth.getAuthData()) {
      return;
    }

    this.openModalButton.addEventListener('click', async () => {
      await this.#modalUtils.showModal(this.modal);
    });

    this.modalForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      this.#modalUtils.startSavePreloader(this.authButton);

      try {
        const signinResponse = await signin(getDataFromForm(this.modalForm));
        isStatusOk(signinResponse);
      }
      catch (err) {
        await this.#modalUtils.endSavePreloader(this.authButton);
        this.#modalUtils.setModalError(err);
        return;
      }

      await this.#modalUtils.endSavePreloader(this.authButton);
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
export default ModalAuth;
