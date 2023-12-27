import { NotificationType, ObjectType } from '@/commons/enums/notification.enum';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class FindAllNotificationDto {
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectType, { each: true })
  object_types: ObjectType[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  notification_types: NotificationType[];
}
