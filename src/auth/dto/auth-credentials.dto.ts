import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @IsEmail()
  username: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be longer than or equal to 8 characters',
  })
  password: string;
}
