import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { CreateReportRecordDto } from '@/report/dto/create-report-record.dto';
import { FindReportDetailDto } from '@/report/dto/find-report-detail.dto';
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

  @Get('/detail/:missionId')
  @UseGuards(JwtAuthGuard)
  async getMissionReportDetail(
    @Param('missionId') missionId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit,
    @Query() query: FindReportDetailDto
  ) {
    return this.reportService.getMissionReportDetail(missionId, page, limit, query);
  }

  @Get('/:reportRecordId')
  @UseGuards(JwtAuthGuard)
  async getReportRecordDetailById(@Param('reportRecordId') reportRecordId: string) {
    return this.reportService.findReportRecordDetailById(reportRecordId);
  }
}
