import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { JourneysModule } from './journeys/journeys.module';
import { FuelRefillsModule } from './fuel-refills/fuel-refills.module';
import { ServiceRecordsModule } from './service-records/service-records.module';
import { MechanicalIssuesModule } from './mechanical-issues/mechanical-issues.module';
import { StockEntriesModule } from './stock-entries/stock-entries.module';
import { SalesEntriesModule } from './sales-entries/sales-entries.module';
import { AllowancesModule } from './allowances/allowances.module';
import { DayHandoversModule } from './day-handovers/day-handovers.module';
import { DirectorModule } from './director/director.module';
import { AuditModule } from './audit/audit.module';
import { StockTypesModule } from './stock-types/stock-types.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    JourneysModule,
    FuelRefillsModule,
    ServiceRecordsModule,
    MechanicalIssuesModule,
    StockEntriesModule,
    SalesEntriesModule,
    AllowancesModule,
    DayHandoversModule,
    DirectorModule,
    AuditModule,
    StockTypesModule,
    UploadsModule,
  ],
})
export class AppModule {}
