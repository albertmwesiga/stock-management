import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty({ example: 'UAA 123B' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Land Cruiser' })
  @IsString()
  model: string;

  @ApiProperty({ example: 90 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  tankCapacity: number;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsNumber()
  currentMileage: number;

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  nextServiceMileage: number;
}
