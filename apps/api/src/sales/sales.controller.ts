import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { SalesService } from './sales.service';
import { CreateSaleRecordDto } from './dto/create-sale-record.dto';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get('records')
  @ApiOperation({ summary: 'List sale records' })
  findAll(
    @Query('vehicleId') vehicleId?: string,
    @Query('journeyId') journeyId?: string,
  ) {
    return this.salesService.findAll({ vehicleId, journeyId });
  }

  @Post('records')
  @UseGuards(RolesGuard)
  @Roles(Role.SALES_MANAGER)
  @ApiOperation({ summary: 'Create a sale record' })
  create(@Body() dto: CreateSaleRecordDto, @CurrentUser() user: any) {
    return this.salesService.create(dto, user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Sales summary' })
  getSummary(@Query('date') date?: string) {
    return this.salesService.getSummary(date);
  }
}
