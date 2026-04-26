import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleRecordDto } from './dto/create-sale-record.dto';
import { FleetGateway } from '../gateway/fleet.gateway';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private gateway: FleetGateway,
  ) {}

  findAll(filters: { vehicleId?: string; journeyId?: string }) {
    return this.prisma.saleRecord.findMany({
      where: {
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters.journeyId && { journeyId: filters.journeyId }),
      },
      include: {
        stockType: true,
        vehicle: true,
        salesManager: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async create(dto: CreateSaleRecordDto, salesManagerId: string) {
    const sale = await this.prisma.saleRecord.create({
      data: {
        ...dto,
        salesManagerId,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
      include: { stockType: true, vehicle: true, salesManager: { select: { id: true, name: true } } },
    });

    this.gateway.emitSaleRecord(sale);
    return sale;
  }

  async getSummary(date?: string) {
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const summary = await this.prisma.saleRecord.aggregate({
      where: { timestamp: { gte: startDate, lte: endDate } },
      _sum: { cashReceived: true, quantity: true, weightKgs: true },
      _count: true,
    });

    return {
      date: startDate.toISOString().split('T')[0],
      totalCash: summary._sum.cashReceived || 0,
      totalQuantity: summary._sum.quantity || 0,
      totalWeightKgs: summary._sum.weightKgs || 0,
      recordCount: summary._count,
    };
  }
}
