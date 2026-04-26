import { IsString, IsNumber, IsOptional, IsEnum, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateFuelRefillDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  journeyId?: string;

  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 'Total Energies Kampala' })
  @IsString()
  stationName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stationLocation?: string;

  @ApiProperty({ example: 45 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  litres: number;

  @ApiProperty({ example: 4800 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  costPerLitre: number;

  @ApiProperty({ example: 216000 })
  @Type(() => Number)
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timestamp?: string;
}
