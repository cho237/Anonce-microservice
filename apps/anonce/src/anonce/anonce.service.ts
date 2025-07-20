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
      throw new ForbiddenException('Seuls les administrateurs peuvent créer des annonces');
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
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });
  }

  // Récupérer une annonce
  async getAnonceById(id: string) {
    const anonce = await this.prisma.anonce.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!anonce) throw new NotFoundException("Annonce non trouvée");
    return anonce;
  }

  // Marquer une annonce comme lue (utilisateur uniquement)
  async markAsRead(userId: string, anonceId: string) {
    const exists = await this.prisma.read.findUnique({
      where: {
        userId_anonceId: {
          userId,
          anonceId,
        },
      },
      include: { anonce: true },
    });
    if (exists) return exists; // Déjà marquée comme lue

    await this.prisma.read.create({
      data: {
        userId,
        anonceId,
      },
    });
    return this.getReadAnonceForUser(userId);
  }

  // Récupérer les annonces lues par un utilisateur
  async getReadAnonceForUser(userId: string) {
    return this.prisma.read.findMany({
      where: { userId },
      include: { anonce: true },
    });
  }

  // Récupérer les utilisateurs ayant lu une annonce (admin uniquement)
  async getReadersForAnonce(adminId: string, anonceId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Seuls les administrateurs peuvent voir les lecteurs');
    }

    return this.prisma.read.findMany({
      where: { anonceId },
      include: { user: true },
    });
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Seuls les administrateurs peuvent supprimer des annonces');
    }
    return this.prisma.anonce.delete({
      where: { id },
    });
  }
}
