import { FileService } from '@/file/file.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { MissionService } from '@/mission/mission.service';
import { CreateReportRecordDto } from '@/report/dto/create-report-record.entity';
import { Report } from '@/report/entities/report.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,

    private fileService: FileService,
    private missionService: MissionService
  ) {}

  async findReportRecordDetailById(reportRecordId: string) {
    const reportRecord = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.sender', 'sender')
      .leftJoinAndSelect('sender.avatar', 'sender_avatar')
      .leftJoinAndSelect('report.files', 'files')
      .where('report.id = :reportRecordId', { reportRecordId })
      .orderBy('files.report_file_order', 'ASC')
      .getOne();

    if (!reportRecord) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Report record'));
    }

    return reportRecord;
  }

  async getReportDetail(page: number, limit: number, missionId: string, participantId: string) {
    await this.missionService.checkParticipantJoinMission(missionId, participantId);

    const qb = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.sender', 'sender')
      .leftJoinAndSelect('sender.avatar', 'sender_avatar')
      .leftJoinAndSelect('report.files', 'files')
      .where('report.mission_id = :missionId', { missionId })
      .andWhere('report.participant_id = :participantId', { participantId })
      .orderBy('report.created_at', 'DESC')
      .orderBy('files.report_file_order', 'ASC');

    return paginate<Report>(qb, { page, limit });
  }

  async createReportRecord(
    user: User,
    createReportRecordDto: CreateReportRecordDto,
    files?: Array<Express.Multer.File>
  ) {
    const {
      mission_id,
      participant_id,
      new_usage_cost = 0,
      description = '',
      content = '',
    } = createReportRecordDto;

    await this.missionService.checkParticipantJoinMission(mission_id, participant_id);

    const reportSaved = await this.reportRepository.save({
      sender: user,
      mission_id,
      participant_id,
      new_usage_cost,
      description,
      content,
    });

    if (files && files.length) {
      await Promise.all(
        files.map(async (file, index) => {
          const reportOrder = index + 1;
          const uploadedFile = await this.fileService.uploadSingleFile(file);

          return this.fileService.uploadFileReportRecord(uploadedFile, reportSaved.id, reportOrder);
        })
      );
    }

    return this.findReportRecordDetailById(reportSaved.id);
  }
}
