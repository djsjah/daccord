import { Router } from 'express';

abstract class AbstractRouter {
  public abstract getRouter(): Router;
  protected abstract setupRouter(): void;
}
export default AbstractRouter;
