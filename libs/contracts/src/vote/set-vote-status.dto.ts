import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class SetVoteStatusDto {
  @ApiProperty({ description: 'ID of the vote' })
  @IsString()
  voteId: string;

  @ApiProperty({ description: 'Status of the vote (active/inactive)' })
  @IsBoolean()
  isActive: boolean;
}
