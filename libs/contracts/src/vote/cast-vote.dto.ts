import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CastVoteDto {
  @ApiProperty({ description: 'ID of the vote' })
  @IsString()
  voteId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'ID of the candidate to vote for' })
  @IsString()
  candidateId: string;
}
