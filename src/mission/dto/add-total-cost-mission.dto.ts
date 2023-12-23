import { IsNumber, IsUUID } from 'class-validator';

export class AddTotalCostMissionDto {
  @IsNumber()
  new_cost: number;
}
