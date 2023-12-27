import { DeviceModule } from '@/device/device.module';
import { FirebaseAdminModule } from '@/firebase-admin/firebase-admin.module';
import { Notification } from '@/notification/entities/notification.entity';
import { NotificationController } from '@/notification/notification.controller';
import { NotificationService } from '@/notification/notification.service';
import { UserModule } from '@/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => FirebaseAdminModule),
    UserModule,
    DeviceModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
