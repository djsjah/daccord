import { Controller, Get, Render } from '@nestjs/common';
import AppService from './app.service';

@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {
    return;
  }

  getHello(): string {
    return this.appService.getHello();
  }
}
export default AppController
