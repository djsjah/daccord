import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery
} from '@nestjs/swagger';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import UserModel from '../../database/schema/user/user.model';
import UserService from './user.service';
import UserDTO from './dto/user.dto';
import formatValidationErrors from '../validator/format.validator';

@ApiTags('users')
@Controller('api/users')
class UserController {
  constructor(private userService: UserService) { }

  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search substring that looks for all matches in either the user`s name or email',
    type: String,
    schema: {
      default: ''
    }
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserModel]
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Users are not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async getAllUsers(@Query('search') searchSubstring: string = ''): Promise<UserModel[] | never> {
    return this.userService.getAllUsers(searchSubstring);
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'User id' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserModel
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserModel | never> {
    return this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: UserDTO,
    examples: {
      'Example Minimum Possible User': {
        value: {
          name: 'awesom-e4000',
          role: 'user',
          email: 'st1035@mail.ru',
          password: 'nbfjNvbd71!!'
        }
      },
      'Example Maximum Possible User': {
        value: {
          name: 'jason_10',
          role: 'admin',
          email: 'type.bvb@ya.ru',
          password: 'nMkjDK88?!!',
          rating: 12,
          contacts: [
            { type: 'phone', value: '8 982 408 31 75' },
            { type: 'telegram', value: '@zira839' }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: UserModel
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
  async createUser(@Body() userData: UserDTO, @Res() res: Response): Promise<Response | never> {
    const newUser = await this.userService.createUser(userData);
    res.status(201).location(`/api/users/${newUser.id}`).send(newUser);
    return res;
  }

  @ApiOperation({ summary: 'Update completely a user by id' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Put()
  async completelyUpdateUser() { }

  @ApiOperation({ summary: 'Update partially a user by id' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch()
  async partiallyUpdateUser() { }

  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiParam({ name: 'id', type: Number, required: true, description: 'User id' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User is not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Delete(':id')
  async removeUser() { }
}
export default UserController;
