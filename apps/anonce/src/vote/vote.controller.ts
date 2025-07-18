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
@ApiResponse({ status: 400, description: 'Invalid input validation' })
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Create a new vote with candidates' })
  @ApiBody({ type: CreateVoteDto })
  @ApiResponse({ status: 201, description: 'Vote created' })
  create(
    @Body() createVoteDto: CreateVoteDto,
    @GetUser('userId') userId: string,
  ) {
    createVoteDto.userId = userId; // Set the userId from the decorator
    return this.voteService.create(createVoteDto);
  }

  @ApiOperation({ summary: 'Cast a vote for a candidate' })
  @ApiBody({ type: CastVoteDto })
  @ApiResponse({ status: 201, description: 'Vote recorded' })
  @ApiResponse({ status: 409, description: 'Already voted or voting closed' })
  @Post('cast')
  @UseGuards(JwtGuard)
  castVote(
    @Body() castVoteDto: CastVoteDto,
    @GetUser('userId') userId: string,
  ) {
    castVoteDto.userId = userId; // Set the userId from the decorator
    return this.voteService.castVote(castVoteDto);
  }

  @ApiOperation({ summary: 'Get vote results with counts' })
  @ApiParam({ name: 'id', description: 'Vote ID' })
  @ApiResponse({ status: 200, description: 'Vote results' })
  @Get(':id/results')
  results(@Param('id') id: string) {
    return this.voteService.results(id);
  }

  @ApiOperation({
    summary: 'Get all votes (optionally filtered by active status)',
  })
  @ApiResponse({ status: 200, description: 'List of votes' })
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

  @ApiOperation({ summary: 'Get users who voted in a vote' })
  @ApiParam({ name: 'id', description: 'Vote ID' })
  @ApiResponse({ status: 200, description: 'List of voters' })
  @Get(':id/voters')
  voters(@Param('id') id: string) {
    return this.voteService.voters(id);
  }

  @ApiOperation({ summary: 'Set vote active status (admin only)' })
  @ApiBody({ type: SetVoteStatusDto })
  @ApiBearerAuth()
  @Patch('active')
  update(@Body() setVoteStatusDto: SetVoteStatusDto) {
    return this.voteService.voteStatus(setVoteStatusDto);
  }

  @ApiOperation({ summary: 'Delete vote (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.voteService.remove(id, userId);
  }
}
