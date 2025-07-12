import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from '@app/contracts/prisma/prisma.module';


@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  imports: [PrismaModule, JwtModule.register({})],
})
export class UserModule {}
