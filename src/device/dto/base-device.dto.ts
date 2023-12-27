import { IsNotEmpty, IsString } from 'class-validator';

export class BaseDeviceDto {
  @IsNotEmpty()
  @IsString()
  fcm_token: string;
}
