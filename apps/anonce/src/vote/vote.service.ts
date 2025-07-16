import { Inject, Injectable } from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { VOTE_PATTERNS } from '@app/contracts/vote/vote.paterns';
import { CreateVoteDto } from '@app/contracts/vote/create-vote.dto';
import { CastVoteDto } from '@app/contracts/vote/cast-vote.dto';
import { SetVoteStatusDto } from '@app/contracts/vote/set-vote-status.dto';

@Injectable()
export class VoteService {
  constructor(@Inject('VOTES_CLIENT') private votesClient: ClientProxy) {}
  create(createVoteDto: CreateVoteDto) {
    return this.votesClient.send(VOTE_PATTERNS.CREATE, createVoteDto);
  }

  castVote(castVoteDto: CastVoteDto) {
    return this.votesClient.send(VOTE_PATTERNS.CAST_VOTE, castVoteDto);
  }

  results(voteId: string) {
    return this.votesClient.send(VOTE_PATTERNS.VOTE_RESULTS, voteId);
  }

  findAll(isActive: boolean) {
    return this.votesClient.send(VOTE_PATTERNS.FIND_ALL, isActive);
  }

  remove(id: string, userId: string) {
    return this.votesClient.send(VOTE_PATTERNS.DELETE_VOTE, { id, userId });
  }

  voters(voteId: string) {
    return this.votesClient.send(VOTE_PATTERNS.GET_VOTERS, voteId);
  }

  voteStatus(setVoteStatusDto: SetVoteStatusDto) {
    return this.votesClient.send(
      VOTE_PATTERNS.SET_VOTE_ACTIVE,
      setVoteStatusDto,
    );
  }
}
