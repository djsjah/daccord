import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import UserModule from '../user/user.module';
import PostController from './post.controller';
import PostModel from '../../database/schema/post/post.model';
import PostService from './post.service';

@Module({
  imports: [
    SequelizeModule.forFeature([PostModel]),
    UserModule
  ],
  exports: [PostService],
  controllers: [PostController],
  providers: [PostService]
})
class PostModule { }
export default PostModule;
