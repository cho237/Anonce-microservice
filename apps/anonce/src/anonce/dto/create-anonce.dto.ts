import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnonceDto {
  @ApiProperty({
    example: 'Comprendre les modules NestJS',
    description: "Le titre de l'annonce",
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: "Cette annonce explique comment fonctionnent les modules dans NestJS...",
    description: "Le contenu complet de l'annonce",
  })
  @IsString()
  @MinLength(10)
  content: string;
}
