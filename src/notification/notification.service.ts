import {
  NotificationType,
  ObjectType,
  notificationActionByType,
  notificationTitleByType,
} from '@/commons/enums/notification.enum';
import { DeviceService } from '@/device/device.service';
import { FirebaseAdminService } from '@/firebase-admin/firebase-admin.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { MissionService } from '@/mission/mission.service';
import { FindAllNotificationDto } from '@/notification/dto/find-all-notification.dto';
import { Notification } from '@/notification/entities/notification.entity';
import { IFindAllNotification } from '@/notification/interfaces/find-all-notification.interface';
import { INotificationParams } from '@/notification/interfaces/notification.interface';
import { ProjectService } from '@/project/project.service';
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
    private firebaseAdminService: FirebaseAdminService,
    private missionService: MissionService,
    private projectService: ProjectService
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

    const { object_id: missionId, related_object_id: projectId } = notification;

    const sender = await this.userService.getUserDetailByUserId(notification.actor_id);
    const mission = await this.missionService.getMissionDetailById(missionId);
    const project = await this.projectService.getProjectNotMissionById(projectId);

    return {
      notification,
      metadata: { sender, project, mission },
    };
  }

  async createPushNotification(
    id: string,
    type: string,
    objectId: string,
    objectType: string,
    relatedObjectId: string,
    senderId: string,
    target: User,
    metadata?: any
  ) {
    const [devices, actorProfile] = await Promise.all([
      this.deviceService.getFcmTokenByUserId(target.id),
      this.userService.findUserById(senderId),
    ]);

    const title = notificationTitleByType(type, actorProfile.username);
    const body = notificationActionByType(type, actorProfile.username);

    const unreadNotificationAmount = await this.unreadNotificationAmount(objectId);

    await Promise.all(
      devices.map((device) => {
        const message: Message = {
          notification: { title, body },
          token: device.fcm_token,
          android: {
            notification: {
              notificationCount: Number(unreadNotificationAmount),
            },
          },
          apns: {
            payload: {
              aps: {
                badge: Number(unreadNotificationAmount),
              },
            },
          },
        };
        message.data = {
          id: String(id),
          title,
          content: body,
          object_type: objectType.toLocaleLowerCase(),
          object_id: String(objectId),
          related_object_id: String(relatedObjectId),
          type: type.toLocaleLowerCase(),
          actor_id: String(senderId),
          target_id: String(target.id),
          metadata: JSON.stringify(metadata),
        };

        return this.firebaseAdminService.sendMessage(message, device.fcm_token);
      })
    );
  }

  async sendNotification(notificationId: string, metadata?: any) {
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
      target,
      metadata
    );
  }

  async createNotification(params: INotificationParams) {
    const { objectType, type, objectId, relatedObjectId, actorId, targetId, metadata, ...rest } =
      params;

    const actorProfile = await this.userService.findUserById(actorId);

    const title = notificationTitleByType(type, actorProfile.username);
    const body = notificationActionByType(type, actorProfile.username);

    const { identifiers }: InsertResult = await this.notificationRepository.insert({
      ...rest,
      object_type: objectType,
      type,
      object_id: objectId,
      actor: { id: actorId },
      target: { id: targetId },
      title,
      content: body,
      related_object_id: relatedObjectId,
    });

    const { id: notificationId } = identifiers[0];
    return this.sendNotification(notificationId, metadata);
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

    qb.where('target_id = :userId', { userId }).andWhere('read_at IS NULL');

    if (object_types) {
      qb.andWhere('object_type IN (:...object_types)', {
        object_types,
      });
    }

    if (notification_types) {
      qb.andWhere('type IN (:...notification_types)', {
        notification_types,
      });
    }

    await qb.execute();

    return 'Successfully updated notification';
  }

  async removeNotification(notificationId: string) {
    const notification = await this.findNotificationById(notificationId);

    await this.notificationRepository.remove(notification);

    return 'Successfully removed notification';
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

    const itemsWithMetadata = await Promise.all(
      items.map(async (item) => {
        const { object_id: missionId, related_object_id: projectId } = item;

        const sender = await this.userService.getUserDetailByUserId(item.actor_id);
        const mission = await this.missionService.getMissionDetailById(missionId);
        const project = await this.projectService.getProjectNotMissionById(projectId);

        return {
          item,
          metadata: { sender, project, mission },
        };
      })
    );

    return {
      items: itemsWithMetadata,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
      unread_count: unreadNotificationAmount,
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
      .where('notification.target_id = :userId', { userId });

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

    qb.orderBy('notification.created_at', 'DESC');

    return qb;
  }

  async unreadNotificationAmount(
    userId: string,
    objectTypes?: ObjectType[],
    notificationTypes?: NotificationType[]
  ) {
    let qb = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.target_id = :userId', { userId })
      .andWhere('notification.read_at IS NULL');

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

    return qb.getCount();
  }
}
