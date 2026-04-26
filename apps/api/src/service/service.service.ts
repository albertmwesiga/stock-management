import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceRecordDto } from './dto/create-service-record.dto';

@Injectable()
export class ServiceRecordsService {
  constructor(private prisma: PrismaService) {}

  findAll(vehicleId?: string) {
    return this.prisma.serviceRecord.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateServiceRecordDto) {
    const record = await this.prisma.serviceRecord.create({
      data: dto,
      include: { vehicle: true },
    });

    await this.prisma.vehicle.update({
      where: { id: dto.vehicleId },
      data: {
        currentMileage: dto.mileageAtService,
        nextServiceMileage: dto.nextServiceMileage,
      },
    });

    return record;
  }
}
