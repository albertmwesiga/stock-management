import { Module } from '@nestjs/common';
import { FuelController } from './fuel.controller';
import { FuelService } from './fuel.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [FuelController],
  providers: [FuelService],
})
export class FuelModule {}
