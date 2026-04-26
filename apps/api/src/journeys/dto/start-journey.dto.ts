import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class StartJourneyDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsNumber()
  startMileage: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
