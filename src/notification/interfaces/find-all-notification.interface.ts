import { FindAllNotificationDto } from '@/notification/dto/find-all-notification.dto';
import { User } from '@/user/entities/user.entity';

export interface IFindAllNotification {
  user: User;
  page: number;
  limit: number;
  query: FindAllNotificationDto;
}
