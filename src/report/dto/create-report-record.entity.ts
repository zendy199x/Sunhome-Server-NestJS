import { IsUUID, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReportRecordDto {
  @IsUUID()
  mission_id: string;

  @IsUUID()
  participant_id: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  new_usage_cost: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  content: string;
}
