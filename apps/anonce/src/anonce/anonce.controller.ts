import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AnonceService } from './anonce.service';
import { CreateAnonceDto } from './dto/create-anonce.dto';
import { UpdateAnonceDto } from './dto/update-anonce.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../user/decorator/get-user.decorator';
import { JwtGuard } from '../user/guard/jwt.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AnonceResponseDto } from './dto/anonce-response.dto';

@ApiTags('Anonces')
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 500, description: 'Internal server error' })
@Serialize(AnonceResponseDto)
@Controller('anonces')
@ApiBearerAuth()
export class AnonceController {
  constructor(private readonly anonceService: AnonceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new anonce (Admin only)' })
  @ApiResponse({ status: 201, description: 'Anonce created successfully' })
  @ApiResponse({ status: 403, description: 'Only admins can create anonce' })
  @UseGuards(JwtGuard)
  create(
    @Body() createAnonceDto: CreateAnonceDto,
    @GetUser('userId') userId: string,
  ) {
    return this.anonceService.createAnonce(userId, createAnonceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all anonce' })
  @ApiResponse({ status: 200, description: 'List of all anonce' })
  getAllArticles() {
    return this.anonceService.findAll();
  }

  @Post('read/:id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Mark an anonce as read (User only)' })
  @ApiResponse({ status: 200, description: 'Anonce marked as read' })
  markAsRead(
    @GetUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) anonceId: string,
  ) {
    return this.anonceService.markAsRead(userId, anonceId);
  }

  @Get('read-by-user')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get anonce read by the current user' })
  @ApiResponse({ status: 200, description: 'List of read anonce' })
  getReadArticles(@GetUser('userId') userId: string) {
    return this.anonceService.getReadAnonceForUser(userId);
  }

  @Get(':id/readers')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Get users who have read a specific anonce (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users who read the anonce',
  })
  @ApiResponse({ status: 403, description: 'Only admins can access this' })
  getReaders(
    @GetUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) anonceId: string,
  ) {
    return this.anonceService.getReadersForAnonce(userId, anonceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get anonce by ID' })
  @ApiResponse({ status: 200, description: 'Anonce found' })
  @ApiResponse({ status: 404, description: 'Anonce not found' })
  getArticleById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.anonceService.getAnonceById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete anonce(Admin only)' })
  @ApiResponse({ status: 200, description: 'Anonce deleted' })
  @ApiResponse({ status: 404, description: 'Anonce not found' })
  deleteAnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.anonceService.remove(id, userId);
  }
}
