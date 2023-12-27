import { MissionStatus } from '@/commons/enums/mission-status.enum';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindMissionDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(MissionStatus, { each: true })
  status: MissionStatus[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  participant_ids: Array<string>;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  created_by_ids: Array<string>;

  @IsString({ message: 'Invalid sort_by value. Must be either "name" or "created_at"' })
  sort_by: 'name' | 'created_at';

  @IsString({ message: 'Invalid order_by value. Must be either "ASC" or "DESC"' })
  order_by: 'ASC' | 'DESC';
}
