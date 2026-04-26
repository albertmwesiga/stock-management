import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStockTypeDto {
  @ApiProperty({ example: 'Tilapia' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  unit: string;

  @ApiProperty({ example: 8500 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  pricePerUnit: number;
}
