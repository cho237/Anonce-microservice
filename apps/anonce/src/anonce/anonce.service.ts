import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnonceDto } from './dto/create-anonce.dto';
import { Role } from '@prisma/client';
import { PrismaService } from '@app/contracts/prisma/prisma.service';


@Injectable()
export class AnonceService {
  constructor(private prisma: PrismaService) {}

  async createAnonce(userId: string, data: CreateAnonceDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create articles');
    }
    return this.prisma.anonce.create({
      data: {
        ...data,
        authorId: userId,
      },
    });
  }

  findAll() {
    return this.prisma.anonce.findMany({
      include: { author: true },
    });
  }

  // Get one article
  async getAnonceById(id: string) {
    const anonce = await this.prisma.anonce.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!anonce) throw new NotFoundException('Anonce not found');
    return anonce;
  }

  // Mark anonce as read (User only)
  async markAsRead(userId: string, anonceId: string) {
    const exists = await this.prisma.read.findUnique({
      where: {
        userId_anonceId: {
          userId,
          anonceId,
        },
      },
    });
    if (exists) return exists; // Already marked

    return this.prisma.read.create({
      data: {
        userId,
        anonceId,
      },
    });
  }

  // Get read status for user
  async getReadAnonceForUser(userId: string) {
    return this.prisma.read.findMany({
      where: { userId },
      include: { anonce: true },
    });
  }

  // Get users who read an anonce (Admin only)
  async getReadersForAnonce(adminId: string, anonceId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view readers');
    }

    return this.prisma.read.findMany({
      where: { anonceId },
      include: { user: true },
    });
  }
}
