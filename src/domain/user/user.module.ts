import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import UserController from './user.controller';
import UserModel from '../../database/schema/user/user.model';
import UserService from './user.service';

@Module({
  imports: [SequelizeModule.forFeature([UserModel])],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService]
})
class UserModule { }
export default UserModule;
