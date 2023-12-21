import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
