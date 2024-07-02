import { getDataFromForm } from '../../../main.js';
import {
  getModalName,
  showModal,
  hideModal,
  resetModal,
  startSavePreloader,
  endSavePreloader,
  setModalError
} from './modal.interface.js';
import { signin, convertResponseToJson, isStatusOk } from '../../data/api/api.constructor.js';

const NAME = getModalName() + 'auth';
const modalAuth = document.querySelector(`.${NAME}`);

export function ModalAuth() {
  const openModalButton = document.querySelector('.header__button_auth');
  const modalForm = document.querySelector(`.${NAME} .modal__body_form`);
  const closeModalButtonArray = document.querySelectorAll(`.${NAME} .modal__button_cancel`);

  openModalButton.addEventListener('click', async () => {
    await showModal(modalAuth, NAME);
  });

  modalForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const addUserButton = document.querySelector(`.${NAME} .modal__button_save`);
    startSavePreloader(addUserButton);

    try {
      const response = await signin(getDataFromForm(modalForm));
      console.log("\n\nПопытка авторизоваться пользователю (http://localhost:5000/auth/signin): ", response);
      isStatusOk(response);

      const data = await convertResponseToJson(response);
      console.log("\nДанные ответа (запрос - http://localhost:5000/auth/signin): ", data);
    }
    catch (err) {
      await endSavePreloader(addUserButton);
      setModalError(err);
      return;
    }

    await endSavePreloader(addUserButton);
    location.reload(true);
  });

  closeModalButtonArray.forEach((closeModalButton) => {
    closeModalButton.addEventListener('click', async () => {
      await hideModal(modalAuth);
    });
  });
}
