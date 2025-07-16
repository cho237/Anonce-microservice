import { Module } from '@nestjs/common';

import { AnonceModule } from './anonce/anonce.module';
import { UserModule } from './user/user.module';
import { VoteModule } from './vote/vote.module';
import { AnonceService } from './anonce/anonce.service';
import { PrismaModule } from '@app/contracts/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AnonceModule, UserModule, VoteModule],
})
export class AppModule {}
