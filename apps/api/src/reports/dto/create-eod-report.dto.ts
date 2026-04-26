import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEndOfDayReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  journeyId?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsString()
  date: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  totalFuelCost: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  totalMileage: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  totalCashCollected: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  cashHandedOver: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  handoverRecipient?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
