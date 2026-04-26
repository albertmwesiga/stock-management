import { Module } from '@nestjs/common';
import { MechanicalController } from './mechanical.controller';
import { MechanicalService } from './mechanical.service';

@Module({
  controllers: [MechanicalController],
  providers: [MechanicalService],
})
export class MechanicalModule {}
