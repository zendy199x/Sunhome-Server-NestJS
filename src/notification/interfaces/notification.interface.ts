import { NotificationType, ObjectType } from '@/commons/enums/notification.enum';

export interface INotificationParams {
  type: NotificationType;
  objectType?: ObjectType;
  objectId?: string;
  relatedObjectId?: string;
  actorId: string;
  targetId: string;
}
