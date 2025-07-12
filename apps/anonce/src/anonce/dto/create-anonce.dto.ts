import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnonceDto {
  @ApiProperty({
    example: 'Understanding NestJS Modules',
    description: 'The title of the anonce',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'This anonce explains how modules work in NestJS...',
    description: 'The full body content of the anonce',
  })
  @IsString()
  @MinLength(10)
  content: string;
}
