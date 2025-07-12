import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [VoteController],
  providers: [VoteService],
  imports: [
    ClientsModule.register([
      {
        name: 'VOTES_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ]),
  ],
})
export class VoteModule {}
