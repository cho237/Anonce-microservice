import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/contracts/prisma/prisma.service';
import { CreateVoteDto } from '@app/contracts/vote/create-vote.dto';
import { CastVoteDto } from '@app/contracts/vote/cast-vote.dto';

@Injectable()
export class VoteService {
  constructor(private readonly prisma: PrismaService) {}

  async createVote(adminId: string, dto: CreateVoteDto) {
    try {
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
      return { success: false, message: 'Failed to create vote' };
    }
  }

  async castVote(userId: string, dto: CastVoteDto) {
    try {
      const vote = await this.prisma.vote.findUnique({
        where: { id: dto.voteId },
      });

      if (!vote) return { success: false, message: 'Vote not found' };
      if (!vote.active)
        return { success: false, message: 'Voting is currently closed' };

      const existing = await this.prisma.voteRecord.findUnique({
        where: { userId_voteId: { userId, voteId: dto.voteId } },
      });
      if (existing)
        return { success: false, message: 'You have already voted.' };

      const candidate = await this.prisma.candidate.findUnique({
        where: { id: dto.candidateId },
      });
      if (!candidate || candidate.voteId !== dto.voteId)
        return { success: false, message: 'Invalid candidate for this vote' };

      await this.prisma.voteRecord.create({
        data: { userId, voteId: dto.voteId, candidateId: dto.candidateId },
      });

      return { success: true, message: 'Vote recorded successfully' };
    } catch (error) {
      console.error('castVote error:', error);
      return { success: false, message: 'Internal server error' };
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
      return { success: true, data: results };
    } catch (error) {
      console.error('getVoteResults error:', error);
      return { success: false, message: 'Failed to get vote results' };
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
      return { success: false, message: 'Failed to get voters' };
    }
  }

  async setVoteActiveStatus(voteId: string, isActive: boolean) {
    try {
      const vote = await this.prisma.vote.findUnique({
        where: { id: voteId },
      });
      if (!vote) return { success: false, message: 'Vote not found' };

      const updated = await this.prisma.vote.update({
        where: { id: voteId },
        data: { active: isActive },
      });
      return { success: true, data: updated };
    } catch (error) {
      console.error('setVoteActiveStatus error:', error);
      return { success: false, message: 'Failed to update vote status' };
    }
  }

  
}
