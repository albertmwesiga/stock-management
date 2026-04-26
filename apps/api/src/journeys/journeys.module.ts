import { Module } from '@nestjs/common';
import { JourneysController } from './journeys.controller';
import { JourneysService } from './journeys.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [JourneysController],
  providers: [JourneysService],
  exports: [JourneysService],
})
export class JourneysModule {}
