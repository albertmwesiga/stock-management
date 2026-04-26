import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartJourneyDto } from './dto/start-journey.dto';
import { StopJourneyDto } from './dto/stop-journey.dto';
import { AddStopDto } from './dto/add-stop.dto';
import { FleetGateway } from '../gateway/fleet.gateway';
import { JourneyStatus } from '@prisma/client';

@Injectable()
export class JourneysService {
  constructor(
    private prisma: PrismaService,
    private gateway: FleetGateway,
  ) {}

  findAll(filters: { vehicleId?: string; driverId?: string }) {
    return this.prisma.journey.findMany({
      where: {
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters.driverId && { driverId: filters.driverId }),
      },
      include: { vehicle: true, driver: { select: { id: true, name: true, email: true } }, stops: true },
      orderBy: { startTime: 'desc' },
    });
  }

  findActive(userId: string, role: string) {
    const where: any = { status: JourneyStatus.ACTIVE };
    if (role === 'DRIVER') where.driverId = userId;
    return this.prisma.journey.findMany({
      where,
      include: { vehicle: true, driver: { select: { id: true, name: true } }, stops: true },
    });
  }

  async findOne(id: string) {
    const journey = await this.prisma.journey.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: { select: { id: true, name: true, email: true } },
        stops: { orderBy: { arrivedAt: 'asc' } },
        fuelRefills: true,
      },
    });
    if (!journey) throw new NotFoundException('Journey not found');
    return journey;
  }

  async start(dto: StartJourneyDto, driverId: string) {
    const active = await this.prisma.journey.findFirst({
      where: { driverId, status: JourneyStatus.ACTIVE },
    });
    if (active) throw new BadRequestException('You already have an active journey');

    const journey = await this.prisma.journey.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId,
        startTime: new Date(),
        startMileage: dto.startMileage,
        notes: dto.notes,
        status: JourneyStatus.ACTIVE,
      },
      include: { vehicle: true, driver: { select: { id: true, name: true } } },
    });

    await this.prisma.vehicle.update({
      where: { id: dto.vehicleId },
      data: { currentMileage: dto.startMileage },
    });

    this.gateway.emitJourneyStarted(journey);
    return journey;
  }

  async stop(id: string, dto: StopJourneyDto, driverId: string) {
    const journey = await this.prisma.journey.findFirst({
      where: { id, driverId, status: JourneyStatus.ACTIVE },
    });
    if (!journey) throw new NotFoundException('Active journey not found');

    const updated = await this.prisma.journey.update({
      where: { id },
      data: {
        endTime: new Date(),
        endMileage: dto.endMileage,
        status: JourneyStatus.COMPLETED,
        notes: dto.notes ?? journey.notes,
      },
      include: { vehicle: true },
    });

    await this.prisma.vehicle.update({
      where: { id: journey.vehicleId },
      data: { currentMileage: dto.endMileage },
    });

    this.gateway.emitJourneyCompleted(updated);
    return updated;
  }

  async addStop(journeyId: string, dto: AddStopDto) {
    const journey = await this.prisma.journey.findFirst({
      where: { id: journeyId, status: JourneyStatus.ACTIVE },
    });
    if (!journey) throw new NotFoundException('Active journey not found');

    const stop = await this.prisma.journeyStop.create({
      data: { journeyId, ...dto, arrivedAt: dto.arrivedAt ? new Date(dto.arrivedAt) : new Date() },
    });

    this.gateway.emitJourneyStopAdded(stop);
    return stop;
  }

  getStops(journeyId: string) {
    return this.prisma.journeyStop.findMany({
      where: { journeyId },
      orderBy: { arrivedAt: 'asc' },
    });
  }
}
