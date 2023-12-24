import { IsNumber } from 'class-validator';

export class AddTotalCostMissionDto {
  @IsNumber()
  new_cost: number;
}
