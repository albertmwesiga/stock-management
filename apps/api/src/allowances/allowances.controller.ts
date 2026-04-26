import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { AllowancesService } from './allowances.service';
import { CreateAllowanceRequestDto } from './dto/create-allowance-request.dto';

@ApiTags('allowances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('allowances')
export class AllowancesController {
  constructor(private allowancesService: AllowancesService) {}

  @Get()
  @ApiOperation({ summary: 'List allowance requests' })
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.allowancesService.findAll(user, status);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request an allowance' })
  request(@Body() dto: CreateAllowanceRequestDto, @CurrentUser() user: any) {
    return this.allowancesService.request(dto, user);
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Approve an allowance (Director only)' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.allowancesService.updateStatus(id, 'APPROVED', user.id);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Reject an allowance (Director only)' })
  reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.allowancesService.updateStatus(id, 'REJECTED', user.id);
  }

  @Put(':id/payout')
  @UseGuards(RolesGuard)
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Mark allowance as paid (Director only)' })
  payout(@Param('id') id: string, @CurrentUser() user: any) {
    return this.allowancesService.updateStatus(id, 'PAID', user.id);
  }
}
