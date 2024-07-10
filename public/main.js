import { IModal } from './js/presentation/modal/modal.interface.js';
import { ModalAuth } from './js/presentation/modal/modal.auth.js';
import { AuthBuilder } from './js/presentation/dom/builder/auth.builder.js';
import { ApiTester } from './js/test/api/api.tester.js';
import {
  getUserAuthData,
  convertResponseToJson,
  isStatusOk
} from './js/data/api/api.constructor.js';

async function main() {
  let authData = null;

  try {
    const response = await getUserAuthData();
    console.log("Попытка получить данные пользователя (http://localhost:5000/auth): ", response);
    isStatusOk(response);

    authData = await convertResponseToJson(response);
    console.log("\nДанные ответа (запрос - http://localhost:5000/auth): ", authData);
  }
  catch (err) {

    console.log(err);
  }

  await AuthBuilder(authData);

  IModal();
  ModalAuth();
  ApiTester();
}

main();

export function useTemplate(template, curElem) {
  curElem.append(template.content.cloneNode(true));
}

export function getDataFromForm(form) {
  return Object.values(form).reduce((obj, field) => {
    if (field.name !== '') {
      obj[field.name] = field.value;
    }

    return obj;
  }, {});
}
