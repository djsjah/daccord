import { useTemplate } from '../../../main.js';

const MODAL_NAME = 'modal_';
const valueTemplate = document.createElement('div');

const decoratorModal = document.querySelector('.decorator_modal');
const disabledBlock = document.querySelector('.disabled-block');
const savePreloaderTemplate = document.querySelector('.preloader-template_save');

const curModal = {
  name: '',
  elem: valueTemplate
};

export function IModal() {
  document.addEventListener('mouseup', (ev) => {
    if (
      !curModal.elem.contains(ev.target) && curModal.elem.classList.contains('modal') &&
      ev.target !== disabledBlock
    ) {
      hideModal(curModal.elem);
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === "Escape" && curModal.elem.classList.contains('modal') && ev.target !== disabledBlock) {
      hideModal(curModal.elem);
    }
  });
}

export async function showModal(modal, name) {
  await toggleAnimInModal(modal);
  curModal.name = name;
  curModal.elem = modal;
}

export async function hideModal(modal) {
  await toggleAnimInModal(modal);
  curModal.name = '';
  curModal.elem = valueTemplate;
}

export function startSavePreloader(modalSaveButton) {
  useTemplate(savePreloaderTemplate, modalSaveButton);
  modalSaveButton.insertBefore(modalSaveButton.children[1], modalSaveButton.children[0]);

  disabledBlock.classList.remove('hidden-total');
  modalSaveButton.classList.add('modal__button_load');
  modalSaveButton.children[0].classList.add('rotate-anim');
}

export async function endSavePreloader(modalSaveButton) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(modalSaveButton.children[0].remove());
    }, 1700);
  });

  disabledBlock.classList.add('hidden-total');
  modalSaveButton.classList.remove('modal__button_load');
}

export function setModalError(err) {
  const modalFoot = document.querySelector(`.${curModal.name} .modal__foot`);
  const modalError = document.querySelector(`.${curModal.name} .modal__error`);

  modalError.textContent = err;
  modalFoot.classList.add('modal__foot_error');
  modalError.classList.remove('hidden-total');
}

export function resetModal(modalForm) {
  modalForm.reset();
}

export function getModalName() {
  return MODAL_NAME;
}

export function getCurModal() {
  return curModal;
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

    decoratorModal.classList.add('hidden-total');
    modal.classList.remove('hide-anim');
    modal.classList.add('hidden-total');
  }
  else {
    decoratorModal.classList.remove('hidden-total');
    decoratorModal.classList.add('appear-anim');

    modal.classList.remove('hidden-total');
    modal.classList.add('modal-appear-anim');
  }
}
