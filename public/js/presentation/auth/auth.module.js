import { ModalAuth } from '../modal/modal.auth.js';
import { cloneNodeFromTemplate } from '../../helpers/helpers.js';
import { logout, isStatusOk } from '../../api/api.constructor.js';

export function AuthModule(authData) {
  authData ?
    useAuthData(authData) : ModalAuth();
}

function useAuthData(authData) {
  const authButton = document.querySelector('.header__button_auth');
  const authText = document.querySelector('.header__user');
  const logoutButtonClone = cloneNodeFromTemplate(
    document.querySelector('.auth-template_logout')
  );

  authText.textContent = authData.data.name;
  authText.classList.remove('display-none');
  authButton.parentNode.replaceChild(logoutButtonClone, authButton);

  const logoutButton = document.querySelector('.header__button_auth_out');

  logoutButton.addEventListener('click', async () => {
    try {
      const logoutResponse = await logout();
      isStatusOk(logoutResponse);
    }
    catch (err) {
      console.log(err);
      return;
    }

    location.reload(true);
  });
}
