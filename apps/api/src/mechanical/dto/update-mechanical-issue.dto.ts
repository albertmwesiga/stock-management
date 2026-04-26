import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateMechanicalIssueDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mechanicName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  repairDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
