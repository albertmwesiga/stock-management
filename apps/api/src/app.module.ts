import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { JourneysModule } from './journeys/journeys.module';
import { FuelModule } from './fuel/fuel.module';
import { StockModule } from './stock/stock.module';
import { SalesModule } from './sales/sales.module';
import { AllowancesModule } from './allowances/allowances.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { GatewayModule } from './gateway/gateway.module';
import { ServiceModule } from './service/service.module';
import { MechanicalModule } from './mechanical/mechanical.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    JourneysModule,
    FuelModule,
    StockModule,
    SalesModule,
    AllowancesModule,
    ReportsModule,
    AuditModule,
    GatewayModule,
    ServiceModule,
    MechanicalModule,
  ],
})
export class AppModule {}
