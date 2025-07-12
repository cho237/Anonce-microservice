import { PartialType } from '@nestjs/mapped-types';
import { CreateAnonceDto } from './create-anonce.dto';

export class UpdateAnonceDto extends PartialType(CreateAnonceDto) {}
