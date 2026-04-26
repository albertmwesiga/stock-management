import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StockEntryType } from '@prisma/client';

export class CreateStockEntryDto {
  @ApiProperty({ enum: StockEntryType })
  @IsEnum(StockEntryType)
  type: StockEntryType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  journeyId?: string;

  @ApiProperty()
  @IsString()
  stockTypeId: string;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKgs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timestamp?: string;
}
