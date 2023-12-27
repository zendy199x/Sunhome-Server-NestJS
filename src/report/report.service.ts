import { NotificationType, ObjectType } from '@/commons/enums/notification.enum';
import { UserRole } from '@/commons/enums/user-role.enum';
import { FileService } from '@/file/file.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { paginateQuery } from '@/helpers/pagination-qb.helper';
import { MissionService } from '@/mission/mission.service';
import { NotificationService } from '@/notification/notification.service';
import { Project } from '@/project/entities/project.entity';
import { CreateReportRecordDto } from '@/report/dto/create-report-record.entity';
import { Report } from '@/report/entities/report.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    private fileService: FileService,
    private missionService: MissionService,
    private notificationService: NotificationService
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

  async getMissionReportDetail(page: number, limit: number, missionId: string) {
    const qb = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.sender', 'sender')
      .leftJoinAndSelect('sender.avatar', 'sender_avatar')
      .leftJoinAndSelect('report.files', 'files')
      .where('report.mission_id = :missionId', { missionId })
      .orderBy('report.created_at', 'DESC')
      .addOrderBy('files.report_file_order', 'ASC');

    return paginateQuery(qb, page, limit);
  }

  async createReportRecord(
    user: User,
    createReportRecordDto: CreateReportRecordDto,
    files?: Express.Multer.File[]
  ) {
    const { id: userId } = user;
    const {
      mission_id,
      new_usage_cost = 0,
      description = '',
      content = '',
    } = createReportRecordDto;

    await this.missionService.checkParticipantJoinMission(mission_id, userId);

    const reportSaved = await this.reportRepository.save({
      sender: user,
      mission_id,
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

    await this.missionService.addUsageCostMission(mission_id, new_usage_cost);

    const mission = await this.missionService.findMissionDetailById(mission_id);

    const project = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.id = :projectId', { projectId: mission.project_id })
      .leftJoinAndSelect('project.missions', 'missions', 'missions.id = :missionId', {
        missionId: mission_id,
      })
      .getOne();

    const targetUserIds = mission.participants
      .filter((participant) => participant.id !== userId)
      .map((participant) => participant.id);

    if ([UserRole.ADMIN, UserRole.LEADER].includes(user.role)) {
      await Promise.all(
        targetUserIds.map((targetUserId) =>
          this.notificationService.createNotification({
            objectType: ObjectType.REPORT,
            type: NotificationType.MANAGER_REPORT,
            actorId: userId,
            targetId: targetUserId,
            objectId: mission_id,
            metadata: project,
          })
        )
      );
    }

    if (user.role === UserRole.MEMBER) {
      await Promise.all(
        targetUserIds.map((targetUserId) =>
          this.notificationService.createNotification({
            objectType: ObjectType.REPORT,
            type: NotificationType.MEMBER_REPORT,
            actorId: userId,
            targetId: targetUserId,
            objectId: mission_id,
            metadata: project,
          })
        )
      );
    }

    return this.findReportRecordDetailById(reportSaved.id);
  }
}
