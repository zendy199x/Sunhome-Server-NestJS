import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { CreateReportRecordDto } from '@/report/dto/create-report-record.entity';
import { ReportService } from '@/report/report.service';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/:reportRecordId')
  @UseGuards(JwtAuthGuard)
  async getReportRecordDetailById(@Param('reportRecordId') reportRecordId: string) {
    return this.reportService.findReportRecordDetailById(reportRecordId);
  }

  @Get('/:missionId/:participantId')
  @UseGuards(JwtAuthGuard)
  async getReportDetail(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit,
    @Param('missionId') missionId: string,
    @Param('participantId') participantId: string
  ) {
    return this.reportService.getReportDetail(page, limit, missionId, participantId);
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
