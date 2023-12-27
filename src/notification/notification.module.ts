import { DeviceModule } from '@/device/device.module';
import { FirebaseAdminModule } from '@/firebase-admin/firebase-admin.module';
import { MissionModule } from '@/mission/mission.module';
import { Notification } from '@/notification/entities/notification.entity';
import { NotificationController } from '@/notification/notification.controller';
import { NotificationService } from '@/notification/notification.service';
import { Project } from '@/project/entities/project.entity';
import { UserModule } from '@/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Project]),
    forwardRef(() => FirebaseAdminModule),
    UserModule,
    DeviceModule,
    MissionModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
