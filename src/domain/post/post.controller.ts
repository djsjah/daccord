import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Query,
  Param,
  Body,
  Res,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import PostModel from '../../database/schema/post/post.model';
import PostService from './post.service';
import PostDTO from './dto/post.dto';
import formatValidationErrors from '../validator/format.validator';

@ApiTags('posts')
@Controller('api/posts')
class PostController {
  constructor(private postService: PostService) { }

  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search substring that looks for all matches in either the post`s title or content',
    type: String,
    schema: {
      default: ''
    }
  })
  @ApiResponse({
    status: 200,
    description: 'List of all posts',
    type: [PostModel]
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Posts are not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async getAllPosts(@Query('search') searchSubstring: string = ''): Promise<PostModel[] | never> {
    return this.postService.getAllPosts(searchSubstring);
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Post id' })
  @ApiResponse({
    status: 200,
    description: 'Post details',
    type: PostModel
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<PostModel | never> {
    return this.postService.getPostById(id);
  }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({
    type: PostDTO,
    examples: {
      'Example Minimum Possible Post': {
        value: {
          title: 'Футбол Испании',
          content: 'Сегодня разберемся с одной из самых захватывающих лиг...',
          authorId: '123e4567-e89b-12d3-a456-426614174000'
        }
      },
      'Example Maximum Possible Post': {
        value: {
          title: 'Футбол Испании',
          content: 'Сегодня разберемся с одной из самых захватывающих лиг...',
          rating: 50,
          tags: ['Испания', 'Футбол'],
          authorId: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created',
    type: PostModel
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({
    transform: true,
    exceptionFactory: (errors) => {
      const formattedErrors = formatValidationErrors(errors);

      return new HttpException(
        {
          statusCode: 422,
          message: formattedErrors,
        },
        422,
      );
    },
  }))
  @Post()
  async createPost(@Body() postData: PostDTO, @Res() res: Response): Promise<Response | never> {
    const newPost = await this.postService.createPost(postData);
    res.status(201).location(`/api/posts/${newPost.id}`).send(newPost);
    return res;
  }

  @ApiOperation({ summary: 'Update completely a post by id' })
  @ApiResponse({ status: 200, description: 'The post has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Put()
  async completelyUpdatePost() { }

  @ApiOperation({ summary: 'Update partially a post by id' })
  @ApiResponse({ status: 200, description: 'The post has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch()
  async partiallyUpdatePost() { }

  @ApiOperation({ summary: 'Delete a post by id' })
  @ApiParam({ name: 'id', type: Number, required: true, description: 'Post id' })
  @ApiResponse({ status: 200, description: 'The post has been successfully deleted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Delete(':id')
  async removePost() { }
}
export default PostController;
