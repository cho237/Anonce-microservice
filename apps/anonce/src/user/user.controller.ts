import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response-dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtGuard } from './guard/jwt.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { GetUser } from './decorator/get-user.decorator';
import { Response } from 'express';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Serialize(UserResponseDto)
  @Post('auth/signup')
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

  @Post('auth/signin')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successfully ' })
  @ApiResponse({ status: 403, description: 'Invalid credentials' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 409,
    description: 'User with given email aready exist',
  })
  async signin(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.userService.signin(signInUserDto);

    // Set the HTTP-only cookie here
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day in ms
    });

    // Return a success message, not the token
    return { message: 'Login successful' };
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successfully ' })
  @ApiResponse({
    status: 409,
    description: 'User with given email aready exist',
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  @Serialize(UserResponseDto)
  @Get()
  @ApiOperation({ summary: 'Get all users ' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 200, description: 'Users =', type: [UserResponseDto] })
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
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.userService.remove(id, userId);
  }

  @Get('auth/me')
  @Serialize(UserResponseDto)
  @ApiOperation({ summary: 'Get logged user info' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 200, description: 'User Info', type: UserResponseDto })
  @UseGuards(JwtGuard)
  getProfile(@GetUser('userId') userId: string) {
    return this.userService.findOne(userId); // or fetch full user if needed
  }
}
