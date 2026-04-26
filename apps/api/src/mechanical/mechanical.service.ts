import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMechanicalIssueDto } from './dto/create-mechanical-issue.dto';
import { UpdateMechanicalIssueDto } from './dto/update-mechanical-issue.dto';

@Injectable()
export class MechanicalService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { vehicleId?: string; resolved?: boolean }) {
    return this.prisma.mechanicalIssue.findMany({
      where: {
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters.resolved !== undefined && {
          resolvedAt: filters.resolved ? { not: null } : null,
        }),
      },
      include: { vehicle: true, journey: true },
      orderBy: { reportedAt: 'desc' },
    });
  }

  create(dto: CreateMechanicalIssueDto) {
    return this.prisma.mechanicalIssue.create({
      data: { ...dto, reportedAt: dto.reportedAt ? new Date(dto.reportedAt) : new Date() },
      include: { vehicle: true },
    });
  }

  async resolve(id: string, dto: UpdateMechanicalIssueDto) {
    const issue = await this.prisma.mechanicalIssue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Mechanical issue not found');
    return this.prisma.mechanicalIssue.update({
      where: { id },
      data: { ...dto, resolvedAt: new Date() },
      include: { vehicle: true },
    });
  }
}
