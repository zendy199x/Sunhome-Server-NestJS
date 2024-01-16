import { FileModule } from '@/file/file.module';
import { MissionModule } from '@/mission/mission.module';
import { NotificationModule } from '@/notification/notification.module';
import { ProjectModule } from '@/project/project.module';
import { Report } from '@/report/entities/report.entity';
import { ReportController } from '@/report/report.controller';
import { ReportService } from '@/report/report.service';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    FileModule,
    ProjectModule,
    MissionModule,
    UserModule,
    NotificationModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
