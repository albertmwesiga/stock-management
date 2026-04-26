import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddStopDto {
  @ApiProperty()
  @IsString()
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsString()
  purpose: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  arrivedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
