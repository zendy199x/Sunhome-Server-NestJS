import { UserRole } from '@/commons/enums/user-role.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterUserListDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsEnum(UserRole, { each: true })
  @IsString({ each: true })
  @Type(() => String)
  roles: UserRole[];

  @IsOptional()
  @IsString()
  orderBy: 'ASC' | 'DESC';
}
