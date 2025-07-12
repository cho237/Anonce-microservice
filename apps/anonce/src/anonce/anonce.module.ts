import { Module } from '@nestjs/common';
import { AnonceService } from './anonce.service';
import { AnonceController } from './anonce.controller';
import { PrismaModule } from '@app/contracts/prisma/prisma.module';


@Module({
   imports: [PrismaModule],
  controllers: [AnonceController],
  providers: [AnonceService],
})
export class AnonceModule {}
