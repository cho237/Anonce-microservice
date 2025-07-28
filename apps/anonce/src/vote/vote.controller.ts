import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { CastVoteDto } from '@app/contracts/vote/cast-vote.dto';
import { SetVoteStatusDto } from '@app/contracts/vote/set-vote-status.dto';
import { CreateVoteDto } from '@app/contracts/vote/create-vote.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { GetUser } from '../user/decorator/get-user.decorator';
import { JwtGuard } from '../user/guard/jwt.guard';

@ApiBearerAuth()
@Controller('votes')
@ApiResponse({
  status: 400,
  description: 'Entrée invalide ou erreur de validation',
})
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Créer un nouveau vote avec des candidats' })
  @ApiBody({ type: CreateVoteDto })
  @ApiResponse({ status: 201, description: 'Vote créé avec succès' })
  create(
    @Body() createVoteDto: CreateVoteDto,
    @GetUser('userId') userId: string,
  ) {
    createVoteDto.userId = userId;
    return this.voteService.create(createVoteDto);
  }

  @ApiOperation({ summary: 'Voter pour un candidat' })
  @ApiBody({ type: CastVoteDto })
  @ApiResponse({ status: 201, description: 'Vote enregistré' })
  @ApiResponse({ status: 409, description: 'Déjà voté ou vote fermé' })
  @Post('voter')
  @UseGuards(JwtGuard)
  castVote(
    @Body() castVoteDto: CastVoteDto,
    @GetUser('userId') userId: string,
  ) {
    castVoteDto.userId = userId;
    console.log('Casting vote for user:', userId);
    return this.voteService.castVote(castVoteDto);
  }

  @ApiOperation({ summary: 'Obtenir les résultats d’un vote' })
  @ApiParam({ name: 'id', description: 'ID du vote' })
  @ApiResponse({ status: 200, description: 'Résultats du vote' })
  @Get(':id/resultats')
  results(@Param('id') id: string) {
    return this.voteService.results(id);
  }

  @ApiOperation({
    summary: 'Obtenir tous les votes (filtrage possible par statut actif)',
  })
  @ApiResponse({ status: 200, description: 'Liste des votes' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @UseGuards(JwtGuard)
  @Get('')
  findAll(
    @GetUser('userId') userId: string,
    @Query('isActive') isActiveBool?: string,
  ) {
    const isActive = isActiveBool === 'true';
    return this.voteService.findAll({ userId, isActive });
  }

  @ApiOperation({ summary: 'Obtenir les utilisateurs ayant voté dans un vote' })
  @ApiParam({ name: 'id', description: 'ID du vote' })
  @ApiResponse({ status: 200, description: 'Liste des votants' })
  @Get(':id/votants')
  voters(@Param('id') id: string) {
    return this.voteService.voters(id);
  }

  @ApiOperation({ summary: 'Activer ou désactiver un vote (admin uniquement)' })
  @ApiBody({ type: SetVoteStatusDto })
  @Patch('activer')
  update(@Body() setVoteStatusDto: SetVoteStatusDto) {
    return this.voteService.voteStatus(setVoteStatusDto);
  }

  @ApiOperation({ summary: 'Supprimer un vote (admin uniquement)' })
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.voteService.remove(id, userId);
  }
}
