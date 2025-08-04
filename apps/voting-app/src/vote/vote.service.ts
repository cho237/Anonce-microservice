import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/contracts/prisma/prisma.service';
import { CreateVoteDto } from '@app/contracts/vote/create-vote.dto';
import { CastVoteDto } from '@app/contracts/vote/cast-vote.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VoteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(data: { userId: string; isActive: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new ForbiddenException('Utilisateur non trouvé.');
    }

    const whereClause: any = {};

    if (user.role !== Role.ADMIN) {
      whereClause.active = data.isActive;
    }

    const votes = await this.prisma.vote.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        candidates: true,
        voteRecords: {
          where: { userId: data.userId },
          select: {
            id: true,
            candidateId: true,
            voteId: true,
            createdAt: true,
          },
        },
      },
    });

    const formatted = votes.map((vote) => ({
      voteData: vote,
      userVote: vote.voteRecords[0] || null,
      voteRecords: undefined,
    }));

    return { success: true, data: formatted };
  }

  async createVote(adminId: string, dto: CreateVoteDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: adminId },
      });
      if (!user || user.role !== Role.ADMIN) {
        return {
          success: false,
          message: 'Seuls les administrateurs peuvent créer des votes',
        };
      }
      const vote = await this.prisma.vote.create({
        data: {
          title: dto.title,
          description: dto.description,
          createdById: adminId,
          candidates: {
            create: dto.candidates.map((c) => ({
              name: c.name,
              description: c.description,
            })),
          },
          active: false,
        },
        include: { candidates: true },
      });
      return { success: true, data: vote };
    } catch (error) {
      console.error('createVote error:', error);
      return { success: false, message: 'Échec de la création du vote' };
    }
  }

  async castVote(userId: string, dto: CastVoteDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) return { success: false, message: 'Utilisateur non trouvé' };

      const passwordMatch = await bcrypt.compare(dto.password, user.password);
      if (!passwordMatch) {
        return { success: false, message: 'Mot de passe invalide' };
      }

      const vote = await this.prisma.vote.findUnique({
        where: { id: dto.voteId },
      });

      if (!vote) return { success: false, message: 'Vote non trouvé' };
      if (!vote.active)
        return { success: false, message: 'Le vote est actuellement fermé' };

      const existing = await this.prisma.voteRecord.findUnique({
        where: { userId_voteId: { userId, voteId: dto.voteId } },
      });
      if (existing) return { success: false, message: 'Vous avez déjà voté.' };

      const candidate = await this.prisma.candidate.findUnique({
        where: { id: dto.candidateId },
      });
      if (!candidate || candidate.voteId !== dto.voteId)
        return { success: false, message: 'Candidat invalide pour ce vote' };

      await this.prisma.voteRecord.create({
        data: { userId, voteId: dto.voteId, candidateId: dto.candidateId },
      });

      return { success: true, message: 'Vote enregistré avec succès' };
    } catch (error) {
      console.error('castVote error:', error);
      return { success: false, message: 'Erreur interne du serveur' };
    }
  }

  async getVoteResults(voteId: string) {
    try {
      const results = await this.prisma.candidate.findMany({
        where: { voteId },
        select: {
          id: true,
          name: true,
          _count: {
            select: { records: true },
          },
        },
      });

      const formattedResults = results.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        count: candidate._count.records,
      }));

      return { success: true, data: formattedResults };
    } catch (error) {
      console.error('getVoteResults error:', error);
      return {
        success: false,
        message: 'Échec de la récupération des résultats du vote',
      };
    }
  }

  async getVoters(voteId: string) {
    try {
      const voters = await this.prisma.voteRecord.findMany({
        where: { voteId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          candidate: { select: { name: true } },
        },
      });
      return { success: true, data: voters };
    } catch (error) {
      console.error('getVoters error:', error);
      return {
        success: false,
        message: 'Échec de la récupération des votants',
      };
    }
  }

  async setVoteActiveStatus(voteId: string, isActive: boolean) {
    try {
      const vote = await this.prisma.vote.findUnique({
        where: { id: voteId },
      });
      if (!vote) return { success: false, message: 'Vote non trouvé' };

      const updated = await this.prisma.vote.update({
        where: { id: voteId },
        data: { active: isActive },
      });
      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        message: 'Échec de la mise à jour du statut du vote',
      };
    }
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.ADMIN) {
      return {
        success: false,
        message: 'Seuls les administrateurs peuvent suprimer des vote',
      };
    }
    return this.prisma.vote.delete({
      where: { id },
    });
  }
}
