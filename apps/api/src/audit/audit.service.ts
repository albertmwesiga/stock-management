import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { userId?: string; entity?: string; limit?: number }) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.entity && { entity: filters.entity }),
      },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
    });
  }

  log(userId: string, action: string, entity: string, entityId?: string, details?: any) {
    return this.prisma.auditLog.create({
      data: { userId, action, entity, entityId, details },
    });
  }
}
