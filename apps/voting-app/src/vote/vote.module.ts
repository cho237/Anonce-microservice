import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';

import { PrismaModule } from '@app/contracts/prisma/prisma.module';

@Module({
  controllers: [VoteController],
  imports: [PrismaModule],
  providers: [VoteService],
})
export class VoteModule {}
