import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnonceDto } from './dto/create-anonce.dto';
import { Role } from '@prisma/client';
import { PrismaService } from '@app/contracts/prisma/prisma.service';
import { CommentAnnonceDto } from './dto/comment-annonce.dto';

@Injectable()
export class AnonceService {
  constructor(private prisma: PrismaService) {}

  async createOrEditAnonce(userId: string, data: CreateAnonceDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Seuls les administrateurs peuvent créer ou modifier des annonces',
      );
    }

    if (data.id) {
      // Edit existing anonce
      const existing = await this.prisma.anonce.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new NotFoundException('Annonce introuvable');
      }

      await this.prisma.anonce.update({
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content,
          // any other fields in CreateAnonceDto
        },
      });
    } else {
      // Create new anonce
      await this.prisma.anonce.create({
        data: {
          ...data,
          authorId: userId,
        },
      });
    }

    return this.findAll();
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
    if (!anonce) throw new NotFoundException('Annonce non trouvée');
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

  async commentAnArticle(userId: string, dto: CommentAnnonceDto) {
    // Optionally, check if the anonce exists
    const anonce = await this.prisma.anonce.findUnique({
      where: { id: dto.anonceId },
    });
    if (!anonce) {
      throw new NotFoundException('Annonce non trouvée');
    }

    await this.prisma.comment.create({
      data: {
        content: dto.content,
        anonceId: dto.anonceId,
        authorId: userId,
      },
    });

    // Return all comments for the post, as in getAnonceDetailsWithComments (author sees all, others see only their own)
    let comments;
    if (anonce.authorId === userId) {
      comments = await this.prisma.comment.findMany({
        where: { anonceId: dto.anonceId },
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      comments = await this.prisma.comment.findMany({
        where: { anonceId: dto.anonceId, authorId: userId },
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    return {
      ...anonce,
      comments,
    };
  }

  async getAnonceDetailsWithComments(anonceId: string, userId: string) {
    const anonce = await this.prisma.anonce.findUnique({
      where: { id: anonceId },
      include: { author: true },
    });
    if (!anonce) throw new NotFoundException('Annonce non trouvée');

    let comments;
    if (anonce.authorId === userId) {
      // Author: show all comments
      comments = await this.prisma.comment.findMany({
        where: { anonceId },
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      // Not author: show only user's comments
      comments = await this.prisma.comment.findMany({
        where: { anonceId, authorId: userId },
        orderBy: { createdAt: 'asc' },
        include: { author: true },
      });
    }

    return {
      ...anonce,
      comments,
    };
  }

  // Récupérer les utilisateurs ayant lu une annonce (admin uniquement)
  async getReadersForAnonce(adminId: string, anonceId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Seuls les administrateurs peuvent voir les lecteurs',
      );
    }

    return this.prisma.read.findMany({
      where: { anonceId },
      include: { user: true },
    });
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Seuls les administrateurs peuvent supprimer des annonces',
      );
    }
    await this.prisma.anonce.delete({
      where: { id },
    });

    return this.findAll();
  }
}
