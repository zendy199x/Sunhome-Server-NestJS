import { IsNumber, IsUUID } from 'class-validator';

export class AddTotalCostMissionDto {
  @IsUUID()
  mission_id: string;

  @IsNumber()
  new_cost: number;
}
