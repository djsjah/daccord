import { setLogoutEvent } from '../../modal/modal.auth.js';

export async function AuthBuilder(authData) {
  if (authData) {
    const authButton = document.querySelector('.header__button_auth');
    const authText = document.querySelector('.header__user');

    authButton.textContent = 'Выйти';
    authText.textContent = authData.data.name;

    authButton.classList.add('header__button_auth_out');
    authText.classList.remove('hidden-total');

    await setLogoutEvent(authButton);
  }
}
