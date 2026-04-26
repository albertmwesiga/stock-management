import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
