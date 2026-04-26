import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class StopJourneyDto {
  @ApiProperty({ example: 45350 })
  @Type(() => Number)
  @IsNumber()
  endMileage: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
