import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { FuelService } from './fuel.service';
import { CreateFuelRefillDto } from './dto/create-fuel-refill.dto';

@ApiTags('fuel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fuel')
export class FuelController {
  constructor(private fuelService: FuelService) {}

  @Get('refills')
  @ApiOperation({ summary: 'List fuel refills' })
  findAll(
    @Query('vehicleId') vehicleId?: string,
    @Query('journeyId') journeyId?: string,
  ) {
    return this.fuelService.findAll({ vehicleId, journeyId });
  }

  @Get('refills/:id')
  findOne(@Param('id') id: string) {
    return this.fuelService.findOne(id);
  }

  @Post('refills')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Log a fuel refill' })
  create(@Body() dto: CreateFuelRefillDto, @CurrentUser() user: any) {
    return this.fuelService.create(dto, user.id);
  }
}
