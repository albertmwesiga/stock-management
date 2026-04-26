import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateServiceRecordDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsNumber()
  mileageAtService: number;

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  nextServiceMileage: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
