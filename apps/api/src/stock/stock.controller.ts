import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { StockService } from './stock.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { CreateStockTypeDto } from './dto/create-stock-type.dto';

@ApiTags('stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('types')
  @ApiOperation({ summary: 'List stock types' })
  findTypes() {
    return this.stockService.findTypes();
  }

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles(Role.DIRECTOR, Role.STOCK_MANAGER)
  createType(@Body() dto: CreateStockTypeDto) {
    return this.stockService.createType(dto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'List stock entries' })
  findEntries(
    @Query('vehicleId') vehicleId?: string,
    @Query('type') type?: string,
    @Query('stockTypeId') stockTypeId?: string,
  ) {
    return this.stockService.findEntries({ vehicleId, type, stockTypeId });
  }

  @Post('entries')
  @UseGuards(RolesGuard)
  @Roles(Role.STOCK_MANAGER)
  @ApiOperation({ summary: 'Create a stock entry (receive/release)' })
  createEntry(@Body() dto: CreateStockEntryDto, @CurrentUser() user: any) {
    return this.stockService.createEntry(dto, user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Stock summary by type' })
  getSummary() {
    return this.stockService.getSummary();
  }
}
