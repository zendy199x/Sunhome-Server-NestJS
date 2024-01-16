import { APP_CONSTANT } from '@/helpers/constants/app.constant';

export enum NotificationType {
  MANAGER_REPORT = 'manager_report', // missionId
  MEMBER_REPORT = 'member_message', // missionId
}

export enum ObjectType {
  REPORT = 'report',
}

export function notificationTitleByType(type: string, _actorName = '') {
  switch (type) {
    case NotificationType.MANAGER_REPORT:
      return 'Bạn có một báo cáo mới từ người quản lý';
    case NotificationType.MEMBER_REPORT:
      return 'Bạn có một tin nhắn mới từ member';
    default:
      return APP_CONSTANT.appName;
  }
}

export function notificationActionByType(type: string, actorName = ''): string {
  switch (type) {
    case NotificationType.MANAGER_REPORT:
      return `Quản lý ${actorName} đã thêm 1 báo cáo mới`;
    case NotificationType.MEMBER_REPORT:
      return `Nhân viên ${actorName} đã thêm 1 báo cáo mới`;
    default:
      return '';
  }
}
