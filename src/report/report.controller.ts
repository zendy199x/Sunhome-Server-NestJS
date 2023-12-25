import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { CreateReportRecordDto } from '@/report/dto/create-report-record.entity';
import { ReportService } from '@/report/report.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './../user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/:reportRecordId')
  @UseGuards(JwtAuthGuard)
  async getReportRecordDetailById(@Param('reportRecordId') reportRecordId: string) {
    return this.reportService.findReportRecordDetailById(reportRecordId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createReportRecord(
    @GetUser() user: User,
    @Body() createReportRecordDto: CreateReportRecordDto,
    @UploadedFiles() files?: Array<Express.Multer.File>
  ) {
    return this.reportService.createReportRecord(user, createReportRecordDto, files);
  }
}
