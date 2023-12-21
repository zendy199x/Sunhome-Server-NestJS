import { UserRole } from '@/commons/enums/user-role.enum';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @Length(8)
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
