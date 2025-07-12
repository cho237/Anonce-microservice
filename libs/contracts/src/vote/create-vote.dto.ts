import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CandidateInput {
  @ApiProperty({ description: 'Description of the candidate' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Display name of the candidate' })
  @IsString()
  name: string;
}

export class CreateVoteDto {
  @ApiProperty({ description: 'Title of the vote' })
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Description of the vote' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'List of candidates for the vote',
    type: [CandidateInput],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateInput)
  candidates: CandidateInput[];
}
