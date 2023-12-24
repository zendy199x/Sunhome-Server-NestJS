import { ReportService } from '@/report/report.service';
import { Controller } from '@nestjs/common';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
}
