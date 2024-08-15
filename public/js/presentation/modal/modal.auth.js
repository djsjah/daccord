import { getDataFromForm } from '../../helpers/helpers.js';
import { signin, isStatusOk } from '../../api/api.constructor.js';
import {
  showModal,
  hideModal,
  startSavePreloader,
  endSavePreloader,
  setModalError
} from './modal.module.js';

const modalAuth = document.querySelector('.modal_auth');

export function ModalAuth() {
  const openModalButton = document.querySelector('.header__button_auth');
  const authButton = modalAuth.querySelector('.modal__button_save');
  const modalForm = modalAuth.querySelector('.modal__body_form');
  const closeModalButtonArray = modalAuth.querySelectorAll('.modal__button_cancel');

  openModalButton.addEventListener('click', async () => {
    await showModal(modalAuth);
  });

  modalForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    startSavePreloader(authButton);

    try {
      const signinResponse = await signin(getDataFromForm(modalForm));
      console.log("\n\nПопытка авторизоваться пользователю (http://localhost:5000/auth/signin): ", signinResponse);
      isStatusOk(signinResponse);

      const userData = await signinResponse.json();
      console.log("\nДанные ответа (запрос - http://localhost:5000/auth/signin): ", userData);
    }
    catch (err) {
      await endSavePreloader(authButton);
      setModalError(modalAuth, err);
      return;
    }

    await endSavePreloader(authButton);
    location.reload(true);
  });

  closeModalButtonArray.forEach((closeModalButton) => {
    closeModalButton.addEventListener('click', async () => {
      await hideModal(modalAuth);
    });
  });
}
