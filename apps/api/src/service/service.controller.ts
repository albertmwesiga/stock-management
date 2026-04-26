import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ServiceRecordsService } from './service.service';
import { CreateServiceRecordDto } from './dto/create-service-record.dto';

@ApiTags('service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service')
export class ServiceController {
  constructor(private serviceService: ServiceRecordsService) {}

  @Get('records')
  @ApiOperation({ summary: 'List service records' })
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.serviceService.findAll(vehicleId);
  }

  @Post('records')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER, Role.DIRECTOR)
  @ApiOperation({ summary: 'Log a service record' })
  create(@Body() dto: CreateServiceRecordDto) {
    return this.serviceService.create(dto);
  }
}
