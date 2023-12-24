import { ReportController } from '@/report/report.controller';
import { ReportService } from '@/report/report.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
