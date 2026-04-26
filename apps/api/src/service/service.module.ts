import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceRecordsService } from './service.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceRecordsService],
})
export class ServiceModule {}
