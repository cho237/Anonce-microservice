import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VoteService } from './vote.service';
import { VOTE_PATTERNS } from '@app/contracts/vote/vote.paterns';

import { CreateVoteDto } from '@app/contracts/vote/create-vote.dto';
import { CastVoteDto } from '@app/contracts/vote/cast-vote.dto';
import { SetVoteStatusDto } from '@app/contracts/vote/set-vote-status.dto';

@Controller()
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @MessagePattern(VOTE_PATTERNS.CREATE)
  create(@Payload() createVoteDto: CreateVoteDto) {
    return this.voteService.createVote(createVoteDto.userId, createVoteDto);
  }

  @MessagePattern(VOTE_PATTERNS.FIND_ALL)
  findAll(@Payload() data: { userId: string; isActive: boolean }) {
    return this.voteService.findAll(data);
  }

  @MessagePattern(VOTE_PATTERNS.CAST_VOTE)
  castVote(@Payload() castVoteDto: CastVoteDto) {
    return this.voteService.castVote(castVoteDto.userId, castVoteDto);
  }

  @MessagePattern(VOTE_PATTERNS.DELETE_VOTE)
  remove(@Payload() deleteVote: { id: string, userId: string }) {
    return this.voteService.remove(deleteVote.id, deleteVote.userId);
  }

  @MessagePattern(VOTE_PATTERNS.VOTE_RESULTS)
  results(@Payload() voteId: string) {
    return this.voteService.getVoteResults(voteId);
  }

  @MessagePattern(VOTE_PATTERNS.GET_VOTERS)
  voters(@Payload() voteId: string) {
    return this.voteService.getVoters(voteId);
  }

  @MessagePattern(VOTE_PATTERNS.SET_VOTE_ACTIVE)
  voteStatus(@Payload() payload: SetVoteStatusDto) {
    return this.voteService.setVoteActiveStatus(
      payload.voteId,
      payload.isActive,
    );
  }
}
