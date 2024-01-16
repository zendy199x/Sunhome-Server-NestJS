import { NotificationType, ObjectType } from '@/commons/enums/notification.enum';
import { UserRole } from '@/commons/enums/user-role.enum';
import { FileService } from '@/file/file.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { paginateQuery } from '@/helpers/pagination-qb.helper';
import { MissionService } from '@/mission/mission.service';
import { NotificationService } from '@/notification/notification.service';
import { ProjectService } from '@/project/project.service';
import { CreateReportRecordDto } from '@/report/dto/create-report-record.dto';
import { FindReportDetailDto } from '@/report/dto/find-report-detail.dto';
import { Report } from '@/report/entities/report.entity';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,

    private fileService: FileService,
    private missionService: MissionService,
    private notificationService: NotificationService,
    private userService: UserService,
    private projectService: ProjectService
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
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Report'));
    }

    return reportRecord;
  }

  async getMissionReportDetail(
    missionId: string,
    page: number,
    limit: number,
    query: FindReportDetailDto
  ) {
    const { sort_by, order_by } = query;

    const qb = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.sender', 'sender')
      .leftJoinAndSelect('sender.avatar', 'sender_avatar')
      .leftJoinAndSelect('report.files', 'files')
      .where('report.mission_id = :missionId', { missionId })
      .orderBy(`report.${sort_by}`, order_by, 'NULLS LAST')
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
    const project = await this.projectService.getProjectNotMissionById(mission.project_id);

    const targetUserIds = mission.participants
      .filter((participant) => participant.id !== userId)
      .map((participant) => participant.id);

    const sender = await this.userService.getUserDetailByUserId(userId);

    if ([UserRole.ADMIN, UserRole.LEADER].includes(user.role)) {
      await Promise.all(
        targetUserIds.map((targetUserId) => {
          this.notificationService.createNotification({
            objectType: ObjectType.REPORT,
            type: NotificationType.MANAGER_REPORT,
            objectId: mission_id,
            relatedObjectId: mission.project_id,
            actorId: userId,
            targetId: targetUserId,
            metadata: { sender, project, mission },
          });
        })
      );
    }

    if (user.role === UserRole.MEMBER) {
      await Promise.all(
        targetUserIds.map((targetUserId) =>
          this.notificationService.createNotification({
            objectType: ObjectType.REPORT,
            type: NotificationType.MEMBER_REPORT,
            objectId: mission_id,
            relatedObjectId: mission.project_id,
            actorId: userId,
            targetId: targetUserId,
            metadata: { sender, project, mission },
          })
        )
      );
    }

    return this.findReportRecordDetailById(reportSaved.id);
  }
}
