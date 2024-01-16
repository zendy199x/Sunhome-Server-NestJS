import { AppController } from '@/app.controller';
import { AuthModule } from '@/auth/auth.module';
import configuration from '@/configs/configuration';
import { DatabaseModule } from '@/database/sql/database.module';
import { DeviceModule } from '@/device/device.module';
import { FileModule } from '@/file/file.module';
import { FirebaseAdminModule } from '@/firebase-admin/firebase-admin.module';
import { MissionModule } from '@/mission/mission.module';
import { NotificationModule } from '@/notification/notification.module';
import { ProjectModule } from '@/project/project.module';
import { ReportModule } from '@/report/report.module';
import { configValidationSchema } from '@/schemas/config.schema';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `src/configs/environments/${process.env.NODE_ENV}.env`,
      validationSchema: configValidationSchema,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    FileModule,
    MissionModule,
    ProjectModule,
    ReportModule,
    NotificationModule,
    DeviceModule,
    FirebaseAdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
