import { MissionStatus } from '@/commons/enums/mission-status.enum';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMissionDto {
  @IsUUID()
  project_id: string;

  @IsString()
  name: string;

  @IsString()
  describe: string;

  @IsNumber()
  total_cost: number;

  @IsNumber()
  usage_cost: number;

  @IsEnum(MissionStatus)
  status: MissionStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  participant_ids: Array<string>;
}
