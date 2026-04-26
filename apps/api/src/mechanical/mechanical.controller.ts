import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MechanicalService } from './mechanical.service';
import { CreateMechanicalIssueDto } from './dto/create-mechanical-issue.dto';
import { UpdateMechanicalIssueDto } from './dto/update-mechanical-issue.dto';

@ApiTags('mechanical')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mechanical')
export class MechanicalController {
  constructor(private mechanicalService: MechanicalService) {}

  @Get('issues')
  @ApiOperation({ summary: 'List mechanical issues' })
  findAll(@Query('vehicleId') vehicleId?: string, @Query('resolved') resolved?: string) {
    return this.mechanicalService.findAll({ vehicleId, resolved: resolved === 'true' });
  }

  @Post('issues')
  @ApiOperation({ summary: 'Report a mechanical issue' })
  create(@Body() dto: CreateMechanicalIssueDto) {
    return this.mechanicalService.create(dto);
  }

  @Put('issues/:id/resolve')
  @ApiOperation({ summary: 'Resolve a mechanical issue' })
  resolve(@Param('id') id: string, @Body() dto: UpdateMechanicalIssueDto) {
    return this.mechanicalService.resolve(id, dto);
  }
}
