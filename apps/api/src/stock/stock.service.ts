import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { CreateStockTypeDto } from './dto/create-stock-type.dto';
import { FleetGateway } from '../gateway/fleet.gateway';
import { StockEntryType } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private gateway: FleetGateway,
  ) {}

  findTypes() {
    return this.prisma.stockType.findMany({ orderBy: { name: 'asc' } });
  }

  createType(dto: CreateStockTypeDto) {
    return this.prisma.stockType.create({ data: dto });
  }

  findEntries(filters: { vehicleId?: string; type?: string; stockTypeId?: string }) {
    return this.prisma.stockEntry.findMany({
      where: {
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters.type && { type: filters.type as StockEntryType }),
        ...(filters.stockTypeId && { stockTypeId: filters.stockTypeId }),
      },
      include: {
        stockType: true,
        vehicle: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async createEntry(dto: CreateStockEntryDto, createdBy: string) {
    const stockType = await this.prisma.stockType.findUnique({ where: { id: dto.stockTypeId } });
    if (!stockType) throw new NotFoundException('Stock type not found');

    const entry = await this.prisma.stockEntry.create({
      data: {
        ...dto,
        createdBy,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
      include: { stockType: true, vehicle: true, creator: { select: { id: true, name: true } } },
    });

    this.gateway.emitStockUpdate(entry);
    return entry;
  }

  async getSummary() {
    const types = await this.prisma.stockType.findMany();
    const summaries = await Promise.all(
      types.map(async (type) => {
        const received = await this.prisma.stockEntry.aggregate({
          where: { stockTypeId: type.id, type: StockEntryType.RECEIVED },
          _sum: { quantity: true, weightKgs: true },
        });
        const released = await this.prisma.stockEntry.aggregate({
          where: { stockTypeId: type.id, type: StockEntryType.RELEASED },
          _sum: { quantity: true, weightKgs: true },
        });
        return {
          stockType: type,
          received: { quantity: received._sum.quantity || 0, weightKgs: received._sum.weightKgs || 0 },
          released: { quantity: released._sum.quantity || 0, weightKgs: released._sum.weightKgs || 0 },
          balance: {
            quantity: (received._sum.quantity || 0) - (released._sum.quantity || 0),
            weightKgs: (received._sum.weightKgs || 0) - (released._sum.weightKgs || 0),
          },
        };
      }),
    );
    return summaries;
  }
}
