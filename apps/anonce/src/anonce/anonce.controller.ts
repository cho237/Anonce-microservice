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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../user/decorator/get-user.decorator';
import { JwtGuard } from '../user/guard/jwt.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AnonceResponseDto } from './dto/anonce-response.dto';
import { CommentAnnonceDto } from './dto/comment-annonce.dto';

@ApiTags('Annonces')
@ApiResponse({ status: 401, description: 'Non autorisé' })
@ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
@Serialize(AnonceResponseDto)
@Controller('anonces')
@ApiBearerAuth()
export class AnonceController {
  constructor(private readonly anonceService: AnonceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle annonce (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Annonce créée avec succès',
    type: [AnonceResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Seuls les administrateurs peuvent créer des annonces',
  })
  @UseGuards(JwtGuard)
  create(
    @Body() createAnonceDto: CreateAnonceDto,
    @GetUser('userId') userId: string,
  ) {
    return this.anonceService.createOrEditAnonce(userId, createAnonceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les annonces' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les annonces',
    type: [AnonceResponseDto],
  })
  getAllArticles() {
    return this.anonceService.findAll();
  }

  @Post('read/:id')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Marquer une annonce comme lue (Utilisateur uniquement)',
  })
  @ApiResponse({ status: 200, description: 'Annonce marquée comme lue' })
  markAsRead(
    @GetUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) anonceId: string,
  ) {
    return this.anonceService.markAsRead(userId, anonceId);
  }

  @Get('read-by-user')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: "Obtenir les annonces lues par l'utilisateur actuel",
  })
  @ApiResponse({ status: 200, description: 'Liste des annonces lues' })
  getReadArticles(@GetUser('userId') userId: string) {
    return this.anonceService.getReadAnonceForUser(userId);
  }

  @Get(':id/readers')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary:
      'Obtenir les utilisateurs ayant lu une annonce spécifique (Admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: "Liste des utilisateurs ayant lu l'annonce",
  })
  @ApiResponse({
    status: 403,
    description: 'Seuls les administrateurs peuvent accéder à ceci',
  })
  getReaders(
    @GetUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) anonceId: string,
  ) {
    return this.anonceService.getReadersForAnonce(userId, anonceId);
  }

  @UseGuards(JwtGuard)
  @Post('comment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Commenter une annonce' })
  @ApiBody({ type: CommentAnnonceDto })
  @ApiResponse({ status: 201, description: 'Commentaire ajouté avec succès.' })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée.' })
  async commentAnArticle(
    @GetUser('userId') userId: string,
    @Body() dto: CommentAnnonceDto,
  ) {
    // Assumes req.user contains the authenticated user with an id property
    // Adjust according to your auth implementation
    // @ts-ignore

    return this.anonceService.commentAnArticle(userId, dto);
  }

  @Get(':id/details')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary:
      "Obtenir les détails d'une annonce avec commentaires selon l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description:
      "Détails de l'annonce avec commentaires (tous pour l'auteur, sinon seulement ceux de l'utilisateur)",
  })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async getAnonceDetailsWithComments(
    @Param('id', new ParseUUIDPipe()) anonceId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.anonceService.getAnonceDetailsWithComments(anonceId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une annonce par ID' })
  @ApiResponse({ status: 200, description: 'Annonce trouvée' })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  getArticleById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.anonceService.getAnonceById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une annonce (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Annonce supprimée',
    type: [AnonceResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  @UseGuards(JwtGuard)
  deleteAnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.anonceService.remove(id, userId);
  }
}
