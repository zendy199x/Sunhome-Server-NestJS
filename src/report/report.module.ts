import { FileModule } from '@/file/file.module';
import { MissionModule } from '@/mission/mission.module';
import { NotificationModule } from '@/notification/notification.module';
import { Project } from '@/project/entities/project.entity';
import { Report } from '@/report/entities/report.entity';
import { ReportController } from '@/report/report.controller';
import { ReportService } from '@/report/report.service';
import { User } from '@/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, User, Project]),
    FileModule,
    MissionModule,
    NotificationModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
