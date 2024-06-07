import { NextFunction, Request, Response } from 'express';
import express from 'express';
import userModule from './user.module';
import UserService from './user.service';
import UserSchema from './validation/schema/user.schema';

const userRouter = express.Router();
const userService: UserService = userModule.getUserServiceSingleton();

userRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const searchSubstring = req.query.search || '';
  const users = await userService.getAllUsers(searchSubstring as string, next);

  if (!res.headersSent) {
    res.json(users);
  }
});

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const user = await userService.getUserById(id, next);

  if (user) {
    res.json(user);
  }
});

userRouter.post('/', async (req: Request, res: Response) => {
  const userData = req.body;
  const { error } = UserSchema.validate(userData);

  if (error) {
    return res.status(422).send(`Validation error: ${error.details[0].message}`);
  }

  const newUser = await userService.createUser(userData);

  if (newUser) {
    res.status(201).location(`/api/users/${newUser.id}`).json(newUser);
  }
});

export default userRouter;
