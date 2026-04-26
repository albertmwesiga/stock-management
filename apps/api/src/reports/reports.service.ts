import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEndOfDayReportDto } from './dto/create-eod-report.dto';
import { JourneyStatus, StockEntryType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getEndOfDay(vehicleId: string, date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const [fuel, sales, journeys] = await Promise.all([
      this.prisma.fuelRefill.aggregate({
        where: { vehicleId, timestamp: { gte: startDate, lte: endDate } },
        _sum: { totalCost: true, litres: true },
      }),
      this.prisma.saleRecord.aggregate({
        where: { vehicleId, timestamp: { gte: startDate, lte: endDate } },
        _sum: { cashReceived: true },
      }),
      this.prisma.journey.findMany({
        where: { vehicleId, startTime: { gte: startDate, lte: endDate } },
        include: { stops: true },
      }),
    ]);

    const totalMileage = journeys.reduce((sum, j) => {
      if (j.endMileage && j.startMileage) return sum + (j.endMileage - j.startMileage);
      return sum;
    }, 0);

    return {
      date,
      vehicleId,
      fuel: { totalCost: fuel._sum.totalCost || 0, litres: fuel._sum.litres || 0 },
      sales: { totalCash: sales._sum.cashReceived || 0 },
      mileage: { total: totalMileage },
      journeys: journeys.length,
    };
  }

  createEndOfDay(dto: CreateEndOfDayReportDto, preparedBy: string) {
    return this.prisma.endOfDayReport.create({
      data: {
        ...dto,
        preparedBy,
        date: new Date(dto.date),
      },
      include: { preparer: { select: { id: true, name: true } } },
    });
  }

  async getLiveSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeJourneys, todayFuel, todaySales, stockSummary, pendingAllowances] = await Promise.all([
      this.prisma.journey.count({ where: { status: JourneyStatus.ACTIVE } }),
      this.prisma.fuelRefill.aggregate({
        where: { timestamp: { gte: today } },
        _sum: { totalCost: true, litres: true },
      }),
      this.prisma.saleRecord.aggregate({
        where: { timestamp: { gte: today } },
        _sum: { cashReceived: true },
      }),
      this.prisma.stockEntry.groupBy({
        by: ['stockTypeId', 'type'],
        _sum: { quantity: true, weightKgs: true },
      }),
      this.prisma.allowanceRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      timestamp: new Date().toISOString(),
      activeJourneys,
      todayFuel: {
        totalCost: todayFuel._sum.totalCost || 0,
        litres: todayFuel._sum.litres || 0,
      },
      todaySales: {
        totalCash: todaySales._sum.cashReceived || 0,
      },
      pendingAllowances,
    };
  }

  getMileageReport(vehicleId?: string) {
    return this.prisma.vehicle.findMany({
      where: vehicleId ? { id: vehicleId } : undefined,
      include: {
        journeys: {
          where: { status: JourneyStatus.COMPLETED },
          select: { id: true, startMileage: true, endMileage: true, startTime: true, endTime: true },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        serviceRecords: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }
}
