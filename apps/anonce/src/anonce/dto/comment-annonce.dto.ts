import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentAnnonceDto {
  @ApiProperty({
    description: 'ID of the anonce (article) to comment on',
    example: 'c1a2b3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsString()
  anonceId: string;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a great article!',
  })
  @IsString()
  content: string;
}
