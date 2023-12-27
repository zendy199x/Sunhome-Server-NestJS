import {
  NotificationType,
  ObjectType,
  notificationActionByType,
  notificationTitleByType,
} from '@/commons/enums/notification.enum';
import { DeviceService } from '@/device/device.service';
import { FirebaseAdminService } from '@/firebase-admin/firebase-admin.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { FindAllNotificationDto } from '@/notification/dto/find-all-notification.dto';
import { Notification } from '@/notification/entities/notification.entity';
import { IFindAllNotification } from '@/notification/interfaces/find-all-notification.interface';
import { INotificationParams } from '@/notification/interfaces/notification.interface';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    private userService: UserService,
    private deviceService: DeviceService,
    private firebaseAdminService: FirebaseAdminService
  ) {}

  async findNotificationById(notificationId: string) {
    const notification = await this.notificationRepository.findOneBy({ id: notificationId });

    if (!notification) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Notification'));
    }
    return notification;
  }

  async getNotificationDetailById(notificationId: string) {
    const notification = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.actor', 'actor')
      .leftJoinAndSelect('notification.target', 'target')
      .leftJoinAndSelect('actor.avatar', 'actor_avatar')
      .leftJoinAndSelect('target.avatar', 'target_avatar')
      .where('notification.id = :notificationId', { notificationId })
      .getOne();

    if (!notification) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Notification'));
    }

    return notification;
  }

  async createPushNotification(
    id: string,
    type: string,
    objectType: string,
    objectId: string,
    relatedObjectId: string,
    senderId: string,
    target: User
  ) {
    const [devices, actorProfile] = await Promise.all([
      this.deviceService.findByUserId(target.id),
      this.userService.findUserById(senderId),
    ]);

    const title = notificationTitleByType(type, actorProfile.username);
    const body = notificationActionByType(type, actorProfile.username, relatedObjectId);

    const unreadNotificationAmount = await this.unreadNotificationAmount(objectId);

    await Promise.all(
      devices.map((device) => {
        const message: Message = {
          notification: { title, body },
          token: device.fcm_token,
          android: {
            notification: {
              notificationCount: Number(unreadNotificationAmount.unread_count),
            },
          },
          apns: {
            payload: {
              aps: {
                badge: Number(unreadNotificationAmount.unread_count),
              },
            },
          },
        };
        message.data = {
          id: String(id),
          title,
          content: body,
          objectType: objectType.toLocaleLowerCase(),
          objectId: String(objectId),
          relatedObjectId: String(relatedObjectId),
          type: type.toLocaleLowerCase(),
          actorId: String(senderId),
          targetId: String(target.id),
        };

        return this.firebaseAdminService.sendMessage(message, device.fcm_token);
      })
    );
  }

  async sendNotification(notificationId: string) {
    const { type, actor, target, object_id, related_object_id, object_type } =
      await this.notificationRepository.findOne({
        where: { id: notificationId },
        relations: { actor: true, target: true },
      });

    this.createPushNotification(
      notificationId,
      type,
      object_id,
      object_type,
      related_object_id,
      actor.id,
      target
    );
  }

  async createNotification(params: INotificationParams) {
    const { type, actorId, targetId, relatedObjectId, ...rest } = params;

    const actorProfile = await this.userService.findUserById(actorId);

    const title = notificationTitleByType(type, actorProfile.username);
    const body = notificationActionByType(type, actorProfile.username, relatedObjectId);

    const { identifiers }: InsertResult = await this.notificationRepository.insert({
      ...rest,
      actor: { id: actorId },
      target: { id: targetId },
      type,
      title,
      content: body,
      related_object_id: relatedObjectId,
    });

    const { id } = identifiers[0];
    return this.sendNotification(id);
  }

  async markNotificationAsRead(user: User, notificationId: string) {
    const { id: userId } = user;

    await this.notificationRepository.update(
      {
        id: notificationId,
        target: { id: userId },
      },
      { read_at: new Date() }
    );

    return this.getNotificationDetailById(notificationId);
  }

  async markAllNotificationAsRead(user: User, markAllNotificationDto: FindAllNotificationDto) {
    const { id: userId } = user;
    const { object_types, notification_types } = markAllNotificationDto;

    const qb = this.notificationRepository.createQueryBuilder().update();

    qb.set({ read_at: () => 'NOW()' });

    qb.where('targetableId = :userId', { userId }).andWhere('readAt IS NULL');

    if (object_types) {
      qb.andWhere('objectType IN (:...object_types)', {
        object_types,
      });
    }

    if (notification_types) {
      qb.andWhere('type IN (:...notification_types)', {
        notification_types,
      });
    }

    await qb.execute();

    return 'Update notification successfully';
  }

  async removeNotification(notificationId: string) {
    const notification = await this.findNotificationById(notificationId);

    await this.notificationRepository.remove(notification);

    return 'Remove notification successfully';
  }

  async getTotalItemsFindAll(user: User): Promise<number> {
    const qb = await this.getQueryFindAll(user);

    const totalItems = await qb.getCount();
    return totalItems;
  }

  async findAllNotification({ user, page, limit, query }: IFindAllNotification) {
    const { id: userId } = user;
    const { object_types, notification_types } = query;

    const qb = await this.getQueryFindAll(user, object_types, notification_types);

    const [items, totalItems] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const unreadNotificationAmount = await this.unreadNotificationAmount(
      userId,
      object_types,
      notification_types
    );

    return {
      items: items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
      unread_count: unreadNotificationAmount.unread_count,
    };
  }

  async getUnreadAmount(user: User, query: FindAllNotificationDto) {
    const { id: userId } = user;
    const { object_types, notification_types } = query;

    const unreadCount = await this.unreadNotificationAmount(
      userId,
      object_types,
      notification_types
    );

    return { unread_count: unreadCount };
  }

  async getQueryFindAll(
    user: User,
    objectTypes?: ObjectType[],
    notificationTypes?: NotificationType[]
  ) {
    const { id: userId } = user;

    let qb = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.targetableId = :userId', { userId });

    if (objectTypes) {
      qb.andWhere('notification.object_type IN (:...objectTypes)', {
        objectTypes,
      });
    }

    if (notificationTypes) {
      qb.andWhere('notification.type IN (:...notificationTypes)', {
        notificationTypes,
      });
    }

    qb.orderBy('notification.createdAt', 'DESC');

    return qb;
  }

  async unreadNotificationAmount(
    userId: string,
    objectTypes?: ObjectType[],
    notificationTypes?: NotificationType[]
  ) {
    let qb = await this.notificationRepository
      .createQueryBuilder('notify')
      .where('notify.targetableId = :userId', { userId })
      .andWhere('notify.readAt IS NULL');

    if (objectTypes) {
      qb.andWhere('notify.objectable_type IN (:...objectTypes)', {
        objectTypes,
      });
    }

    if (notificationTypes) {
      qb.andWhere('notify.type IN (:...notificationTypes)', {
        notificationTypes,
      });
    }

    return { unread_count: qb.getCount() };
  }
}
