import { ReportController } from '@/report/report.controller';
import { ReportService } from '@/report/report.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '@/report/entities/report.entity';
import { FileModule } from '@/file/file.module';
import { MissionModule } from '@/mission/mission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), FileModule, MissionModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
