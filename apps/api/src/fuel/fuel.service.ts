import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuelRefillDto } from './dto/create-fuel-refill.dto';
import { FleetGateway } from '../gateway/fleet.gateway';

@Injectable()
export class FuelService {
  constructor(
    private prisma: PrismaService,
    private gateway: FleetGateway,
  ) {}

  findAll(filters: { vehicleId?: string; journeyId?: string }) {
    return this.prisma.fuelRefill.findMany({
      where: {
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters.journeyId && { journeyId: filters.journeyId }),
      },
      include: { vehicle: true, driver: { select: { id: true, name: true } } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findOne(id: string) {
    const refill = await this.prisma.fuelRefill.findUnique({
      where: { id },
      include: { vehicle: true, driver: { select: { id: true, name: true } } },
    });
    if (!refill) throw new NotFoundException('Fuel refill not found');
    return refill;
  }

  async create(dto: CreateFuelRefillDto, driverId: string) {
    const totalCost = dto.litres * dto.costPerLitre;
    const refill = await this.prisma.fuelRefill.create({
      data: {
        ...dto,
        driverId,
        totalCost,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
      include: { vehicle: true, driver: { select: { id: true, name: true } } },
    });

    this.gateway.emitFuelRefill(refill);
    return refill;
  }
}
