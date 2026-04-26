import { IsNumber, IsString, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAllowanceRequestDto {
  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Meals during overnight trip to Masaka' })
  @IsString()
  reason: string;
}
