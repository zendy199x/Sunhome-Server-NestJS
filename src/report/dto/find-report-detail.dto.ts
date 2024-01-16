import { IsString } from 'class-validator';

export class FindReportDetailDto {
  @IsString({ message: 'Invalid sort_by value. Must be either "name" or "created_at"' })
  sort_by: 'created_at';

  @IsString({ message: 'Invalid order_by value. Must be either "ASC" or "DESC"' })
  order_by: 'ASC' | 'DESC';
}
