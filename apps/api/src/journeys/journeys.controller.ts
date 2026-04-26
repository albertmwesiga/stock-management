import {
  Controller, Get, Post, Param, Body, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { JourneysService } from './journeys.service';
import { StartJourneyDto } from './dto/start-journey.dto';
import { StopJourneyDto } from './dto/stop-journey.dto';
import { AddStopDto } from './dto/add-stop.dto';

@ApiTags('journeys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journeys')
export class JourneysController {
  constructor(private journeysService: JourneysService) {}

  @Get()
  @ApiOperation({ summary: 'List journeys' })
  findAll(@Query('vehicleId') vehicleId?: string, @Query('driverId') driverId?: string) {
    return this.journeysService.findAll({ vehicleId, driverId });
  }

  @Get('active')
  findActive(@CurrentUser() user: any) {
    return this.journeysService.findActive(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journeysService.findOne(id);
  }

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Start a new journey' })
  start(@Body() dto: StartJourneyDto, @CurrentUser() user: any) {
    return this.journeysService.start(dto, user.id);
  }

  @Post(':id/stop')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Stop/complete an active journey' })
  stop(@Param('id') id: string, @Body() dto: StopJourneyDto, @CurrentUser() user: any) {
    return this.journeysService.stop(id, dto, user.id);
  }

  @Post(':id/stops')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Add a stop to a journey' })
  addStop(@Param('id') id: string, @Body() dto: AddStopDto) {
    return this.journeysService.addStop(id, dto);
  }

  @Get(':id/stops')
  getStops(@Param('id') id: string) {
    return this.journeysService.getStops(id);
  }
}
