import { DeviceModule } from '@/device/device.module';
import { PushNotification } from '@/firebase-admin/entities/push-notification.entity';
import { FirebaseAdminProvider } from '@/firebase-admin/firebase-admin.provider';
import { FirebaseAdminService } from '@/firebase-admin/firebase-admin.service';
import { NotificationModule } from '@/notification/notification.module';
import { UserModule } from '@/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushNotification]),
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    DeviceModule,
  ],
  providers: [FirebaseAdminProvider, FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
