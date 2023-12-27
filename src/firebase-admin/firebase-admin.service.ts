import { FirebaseErrorCode } from '@/commons/enums/firebase-error-code.enum';
import { DeviceService } from '@/device/device.service';
import { PushNotification } from '@/firebase-admin/entities/push-notification.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Message, TokenMessage, TopicMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { Repository } from 'typeorm';

@Injectable()
export class FirebaseAdminService {
  constructor(
    @InjectRepository(PushNotification)
    private pushNotificationRepository: Repository<PushNotification>,
    private deviceService: DeviceService
  ) {}

  async sendMessage(message: Message, fcmToken: string) {
    admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
        this.logPushNotificationFromMessage(message, 1);
      })
      .catch((error) => {
        this.catchInvalidToken(error, (message as TokenMessage)?.token || null);
        console.log('Error sending message:', error);
        if (
          [FirebaseErrorCode.TOKEN_NOT_REGISTERED, FirebaseErrorCode.THIRD_PARTY_AUTH].includes(
            error.errorInfo.code
          )
        ) {
          this.deviceService.removeDeviceByFcmToken(fcmToken);
        }
        this.logPushNotificationFromMessage(message, 0);
      });
  }

  async logPushNotificationFromMessage(message: Message, status: number) {
    const token: string = (message as TokenMessage)?.token || null;
    const topic: string = (message as TopicMessage)?.topic || null;
    await this.pushNotificationRepository.insert({
      notification_title: message.notification.title,
      notification_body: message.notification.body,
      data: JSON.stringify(message.data),
      device_token: token,
      status,
      topic,
    });
  }

  async catchInvalidToken(error: any, fcmToken: string) {
    if (fcmToken != null) {
      if (error?.errorInfo?.code === FirebaseErrorCode.INVALID_CODE) {
        return this.deviceService.removeInvalid(fcmToken);
      }
    }
  }
}
