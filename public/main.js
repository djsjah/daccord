import DI from './js/app.container.js';
import AppModule from './js/app.module.js';

async function main() {
  window.onpageshow = function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  };

  await DI.registerInstance('appModule', new AppModule()).onModuleInit();
}

main();
