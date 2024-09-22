import DI from '../../js/app.container.js';
import AppModule from './app.module.js';

async function main() {
  await DI.registerInstance('appModule', new AppModule()).onModuleInit();
}

main();
