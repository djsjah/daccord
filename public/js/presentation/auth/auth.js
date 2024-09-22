import { cloneNodeFromTemplate } from '../../helpers/helpers.js';
import {
  getUserAuthData,
  logout,
  isStatusOk
} from '../../api/api.js';

class UserAuth {
  authButton = document.querySelector('.header__link_auth');
  authText = document.querySelector('.header__user');
  logoutButtonClone = cloneNodeFromTemplate(
    document.querySelector('.auth-template_logout')
  );

  #authData = null;

  async init() {
    await this.#setUserAuthData();
    if (this.#authData) {
      this.#setupLogout();
    }
  }

  getAuthData() {
    return this.#authData;
  }

  async #setUserAuthData() {
    try {
      const authResponse = await getUserAuthData();
      isStatusOk(authResponse);
      this.#authData = (await authResponse.json()).data;
    }
    catch (err) {
      console.log(err);
    }
  }

  #setupLogout() {
    this.authText.textContent = this.#authData.name;
    this.authText.classList.remove('display-none');
    this.authButton.parentNode.replaceChild(this.logoutButtonClone, this.authButton);

    const logoutButton = document.querySelector('.header__link_auth_out');
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
}
export default UserAuth;
