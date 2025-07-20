import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';
import { SignInUserDto } from './dto/signin-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@app/contracts/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException("Un utilisateur avec cet e-mail existe déjà");
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        role: Role.USER,
        password: hashedPassword,
      },
    });
  }

  async signin(signInUserDto: SignInUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: signInUserDto.email },
    });
    if (!user) {
      throw new ForbiddenException("Identifiants invalides");
    }
    const pwMatch = await bcrypt.compare(signInUserDto.password, user.password);
    if (!pwMatch) throw new ForbiddenException("Identifiants invalides");
    
    const token = await this.signToken(user.id, user.email, user.role);
    return {
      access_token: token,
    };
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async signToken(userId: string, email: string, role: Role) {
    const payload = {
      email,
      role,
      userId,
    };

    return this.jwtService.signAsync(payload, {
      secret: 'secret',
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException("Seuls les administrateurs peuvent supprimer des utilisateurs");
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
