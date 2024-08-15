import { cloneNodeFromTemplate } from '../../helpers/helpers.js';

const decoratorModal = document.querySelector('.decorator_modal');
const disabledBlock = document.querySelector('.disabled-block');
const savePreloader = cloneNodeFromTemplate(
  document.querySelector('.preloader-template_save')
);

let curModal = null;

export function ModalModule() {
  document.addEventListener('mouseup', (ev) => {
    if (curModal && !curModal.contains(ev.target) && ev.target !== disabledBlock) {
      hideModal(curModal);
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === "Escape" && curModal && ev.target !== disabledBlock) {
      hideModal(curModal);
    }
  });
}

export async function showModal(modal) {
  await toggleAnimInModal(modal);
  curModal = modal;
}

export async function hideModal(modal) {
  await toggleAnimInModal(modal);
  curModal = null;
}

export function startSavePreloader(modalSaveButton) {
  modalSaveButton.append(savePreloader);
  modalSaveButton.insertBefore(modalSaveButton.children[1], modalSaveButton.children[0]);

  disabledBlock.classList.remove('display-none');
  modalSaveButton.classList.add('modal__button_load');
  modalSaveButton.children[0].classList.add('rotate-anim');
}

export async function endSavePreloader(modalSaveButton) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(modalSaveButton.children[0].remove());
    }, 1700);
  });

  disabledBlock.classList.add('display-none');
  modalSaveButton.classList.remove('modal__button_load');
}

export function setModalError(modal, error) {
  const modalFoot = modal.querySelector('.modal__foot');
  const modalError = modal.querySelector('.modal__error');

  modalError.textContent = error;
  modalFoot.classList.add('modal__foot_error');
  modalError.classList.remove('display-none');
}

export function resetModal(modalForm) {
  modalForm.reset();
}

async function toggleAnimInModal(modal) {
  if (modal.classList.contains('modal-appear-anim')) {
    decoratorModal.classList.remove('appear-anim');
    decoratorModal.classList.add('hide-anim');

    modal.classList.remove('modal-appear-anim');
    modal.classList.add('hide-anim');

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(decoratorModal.classList.remove('hide-anim'));
      }, 300);
    });

    decoratorModal.classList.add('display-none');
    modal.classList.remove('hide-anim');
    modal.classList.add('display-none');
  }
  else {
    decoratorModal.classList.remove('display-none');
    decoratorModal.classList.add('appear-anim');

    modal.classList.remove('display-none');
    modal.classList.add('modal-appear-anim');
  }
}
