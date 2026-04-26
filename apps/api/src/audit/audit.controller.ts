import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIRECTOR)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs (Director only)' })
  findAll(
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll({ userId, entity, limit: limit ? parseInt(limit) : 100 });
  }
}
