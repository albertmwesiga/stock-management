import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMechanicalIssueDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  journeyId?: string;

  @ApiProperty({ example: 'Brake pads worn out' })
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reportedAt?: string;
}
