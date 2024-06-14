import { Request, Response } from 'express';

class AppController {
  public getMainPage(req: Request, res: Response) {
    return res.send('Hello World!');
  }
}
export default AppController;
