import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSaleRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  journeyId?: string;

  @ApiProperty({ example: 'Nakasero Market' })
  @IsString()
  deliveryPoint: string;

  @ApiProperty()
  @IsString()
  stockTypeId: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKgs?: number;

  @ApiProperty({ example: 850000 })
  @Type(() => Number)
  @IsNumber()
  cashReceived: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
