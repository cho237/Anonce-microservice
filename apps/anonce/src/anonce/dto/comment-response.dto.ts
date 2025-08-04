import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response-dto';

export class CommentResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  author: UserResponseDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
