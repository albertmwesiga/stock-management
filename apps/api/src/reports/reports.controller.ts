import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateEndOfDayReportDto } from './dto/create-eod-report.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('end-of-day/:vehicleId/:date')
  @ApiOperation({ summary: 'Get end-of-day report for vehicle and date' })
  getEndOfDay(@Param('vehicleId') vehicleId: string, @Param('date') date: string) {
    return this.reportsService.getEndOfDay(vehicleId, date);
  }

  @Post('end-of-day')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER, Role.SALES_MANAGER)
  @ApiOperation({ summary: 'Submit end-of-day report' })
  createEndOfDay(@Body() dto: CreateEndOfDayReportDto, @CurrentUser() user: any) {
    return this.reportsService.createEndOfDay(dto, user.id);
  }

  @Get('director/live-summary')
  @UseGuards(RolesGuard)
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Live director summary snapshot' })
  getLiveSummary() {
    return this.reportsService.getLiveSummary();
  }

  @Get('mileage')
  @ApiOperation({ summary: 'Vehicle mileage report' })
  getMileageReport(@Query('vehicleId') vehicleId?: string) {
    return this.reportsService.getMileageReport(vehicleId);
  }
}
