import { APP_CONSTANT } from '@/helpers/constants/app.constant';

export enum NotificationType {
  RECOMMEND_JOB = 'recommend_job', // eventID
  ACCEPT_APPLY = 'accept_apply', // eventID
  REJECT_APPLY = 'reject_apply', // eventID
  INVITE_APPLY = 'invite_apply', // eventID
  APPLY_JOB = 'apply_job', // eventApplyID
  EDIT_JOB = 'edit_job', // eventID
  REVIEW_CREW = 'review_crew', // eventApplyID
  ORGANIZER_CANCELED = 'organizer_canceled', // eventID
  CREW_CANCELED = 'crew_canceled', // eventID
  PAID_APPLY = 'paid_apply', // applicationID
  PAYMENT_DUE = 'payment_due', // applicationID
  TRANSFER_ORGANIZER = 'transfer_organizer', // userTransferredID - applicationID
  TRANSFER_CREW = 'transfer_crew', // userTransferredID - applicationID
  REMIND_EVENT = 'remind_event', // eventID
  NEW_MESSAGE = 'new_message', // eventId
}

export enum ObjectType {
  EVENT = 'event',
  CHAT = 'chat',
}

export function notificationTitleByType(type: string, actorName = '') {
  switch (type) {
    case NotificationType.RECOMMEND_JOB:
      return "Don't miss out on these jobs";
    case NotificationType.ACCEPT_APPLY:
      return 'Congratulations! Your application has been accepted';
    case NotificationType.REJECT_APPLY:
      return 'Your application has not been accepted';
    case NotificationType.INVITE_APPLY:
      return 'You are invited to apply for a job';
    case NotificationType.APPLY_JOB:
      return 'There is a crew applying for a job';
    case NotificationType.EDIT_JOB:
      return 'Job information has been changed';
    case NotificationType.REVIEW_CREW:
      return "You've got a new rating";
    case NotificationType.ORGANIZER_CANCELED:
      return 'Organizer canceled the event';
    case NotificationType.CREW_CANCELED:
      return 'Crew canceled the event application';
    case NotificationType.PAID_APPLY:
      return 'There is a paid job';
    case NotificationType.PAYMENT_DUE:
      return 'Pay for crew now';
    case NotificationType.TRANSFER_ORGANIZER:
      return 'There is a crew who wants to transfer the application to another crew';
    case NotificationType.TRANSFER_CREW:
      return 'There is a job transferred for you';
    case NotificationType.TRANSFER_CREW:
      return "There's an event coming up";
    case NotificationType.NEW_MESSAGE:
      return `${actorName} has sent you a message`;
    default:
      return APP_CONSTANT.appName;
  }
}

export function notificationActionByType(type: string, actorName = '', objectName = ''): string {
  switch (type) {
    case NotificationType.RECOMMEND_JOB:
      return 'There are upcoming jobs waiting for you. Apply now';
    case NotificationType.ACCEPT_APPLY:
      return `${actorName} has accepted your application`;
    case NotificationType.REJECT_APPLY:
      return `${actorName} has rejected your application`;
    case NotificationType.INVITE_APPLY:
      return `${actorName} invited you to apply for a job`;
    case NotificationType.APPLY_JOB:
      return `${actorName} has applied for the job`;
    case NotificationType.EDIT_JOB:
      return `${actorName} has changed job information. Please check`;
    case NotificationType.REVIEW_CREW:
      return `${actorName} has rated you`;
    case NotificationType.ORGANIZER_CANCELED:
      return `${actorName} has canceled the event you attended`;
    case NotificationType.CREW_CANCELED:
      return `${actorName} has canceled the application`;
    case NotificationType.PAID_APPLY:
      return `${actorName} paid for 1 job`;
    case NotificationType.PAYMENT_DUE:
      return `It's time to pay for the crew`;
    case NotificationType.TRANSFER_ORGANIZER:
      return `${actorName} has transferred 1 job, check it out now`;
    case NotificationType.TRANSFER_CREW:
      return `${actorName} has agreed to transfer 1 job to you, check it out now`;
    case NotificationType.REMIND_EVENT:
      return `You have an event coming up within the next 36 hours`;
    case NotificationType.NEW_MESSAGE:
      return `${objectName}`;
    default:
      return '';
  }
}
