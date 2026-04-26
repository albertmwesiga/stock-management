import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAllowanceRequestDto } from './dto/create-allowance-request.dto';
import { AllowanceStatus } from '@prisma/client';

@Injectable()
export class AllowancesService {
  constructor(private prisma: PrismaService) {}

  findAll(user: any, status?: string) {
    const where: any = {};
    if (user.role !== 'DIRECTOR') where.requesterId = user.id;
    if (status) where.status = status as AllowanceStatus;

    return this.prisma.allowanceRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, role: true } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async request(dto: CreateAllowanceRequestDto, user: any) {
    return this.prisma.allowanceRequest.create({
      data: {
        ...dto,
        requesterId: user.id,
        role: user.role,
      },
      include: { requester: { select: { id: true, name: true, role: true } } },
    });
  }

  async updateStatus(id: string, status: string, approverId: string) {
    const existing = await this.prisma.allowanceRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Allowance request not found');

    const data: any = { status: status as AllowanceStatus };
    if (status === 'APPROVED' || status === 'REJECTED') {
      data.approvedBy = approverId;
      data.approvedAt = new Date();
    }
    if (status === 'PAID') {
      data.paidAt = new Date();
    }

    return this.prisma.allowanceRequest.update({
      where: { id },
      data,
      include: {
        requester: { select: { id: true, name: true, role: true } },
        approver: { select: { id: true, name: true } },
      },
    });
  }
}
