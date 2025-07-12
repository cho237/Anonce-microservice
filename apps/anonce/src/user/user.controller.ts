import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response-dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtGuard } from './guard/jwt.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { GetUser } from './decorator/get-user.decorator';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Serialize(UserResponseDto)
  @Post('/signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input validation' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 409,
    description: 'User with given email aready exist',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successfully ' })
  @ApiResponse({ status: 403, description: 'Invalid credentials' })
  @ApiResponse({
    status: 409,
    description: 'User with given email aready exist',
  })
  signin(@Body() signInUserDto: SignInUserDto) {
    return this.userService.signin(signInUserDto);
  }

  @Serialize(UserResponseDto)
  @Get()
  @UseGuards(JwtGuard)
  findAll() {
    return this.userService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.userService.remove(id, userId);
  }
}
