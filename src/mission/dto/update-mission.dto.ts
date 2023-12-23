import { MissionStatus } from '@/commons/enums/mission-status.enum';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  describe: string;

  @IsOptional()
  @IsNumber()
  total_cost: number;

  @IsOptional()
  @IsNumber()
  usage_cost: number;

  @IsOptional()
  @IsEnum(MissionStatus)
  status: MissionStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  participant_ids: Array<string>;
}
