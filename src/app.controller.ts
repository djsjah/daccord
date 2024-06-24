import { Request, Response } from 'express';
import path from 'path';

class AppController {
  public renderMainPage(req: Request, res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
}
export default AppController;
