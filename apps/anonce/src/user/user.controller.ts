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
  @ApiOperation({ summary: 'Enregistrer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet e-mail existe déjà',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('auth/signin')
  @ApiOperation({ summary: 'Connexion de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 403, description: 'Identifiants invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet e-mail existe déjà',
  })
  async signin(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.userService.signin(signInUserDto);

    // Définir le cookie HTTP-only
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    });

    // Retourner un message de succès
    return { message: 'Connexion réussie' };
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Déconnexion de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Déconnecté avec succès' };
  }

  @Serialize(UserResponseDto)
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs',
    type: [UserResponseDto],
  })
  @UseGuards(JwtGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.userService.remove(id, userId);
  }

  @Get('auth/me')
  @Serialize(UserResponseDto)
  @ApiOperation({
    summary: 'Récupérer les informations de l’utilisateur connecté',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 200,
    description: 'Informations de l’utilisateur',
    type: UserResponseDto,
  })
  @UseGuards(JwtGuard)
  getProfile(@GetUser('userId') userId: string) {
    return this.userService.findOne(userId);
  }
}
