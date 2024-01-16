import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { paginateQuery } from '@/helpers/pagination-qb.helper';
import { AddTotalCostMissionDto } from '@/mission/dto/add-total-cost-mission.dto';
import { CreateMissionDto } from '@/mission/dto/create-mission.dto';
import { UpdateMissionDto } from '@/mission/dto/update-mission.dto';
import { Mission } from '@/mission/entities/mission.entity';
import { ProjectService } from '@/project/project.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindMissionDto } from '@/mission/dto/find-mission.dto';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,

    private userService: UserService,
    private projectService: ProjectService
  ) {}

  async findMissionById(missionId: string) {
    const mission = await this.missionRepository.findOneBy({ id: missionId });

    if (!mission) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Mission'));
    }
    return mission;
  }

  async findMissionDetailById(missionId: string): Promise<Mission> {
    const mission = await this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.created_by', 'mission_created_by')
      .leftJoinAndSelect('mission_created_by.avatar', 'mission_create_by_avatar')
      .leftJoinAndSelect('mission.participants', 'participants')
      .leftJoinAndSelect('participants.avatar', 'participant_avatar')
      .where('mission.id = :missionId', { missionId })
      .orderBy('participants.created_at', 'ASC')
      .getOne();

    if (!mission) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Mission'));
    }
    return mission;
  }

  async getMissionByProjectId(
    page: number,
    limit: number,
    projectId: string,
    query: FindMissionDto
  ) {
    const { name, status, participant_ids, created_by_ids, sort_by, order_by } = query;

    const qb = await this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.participants', 'participants')
      .leftJoinAndSelect('participants.avatar', 'participant_avatar')
      .where('mission.project_id = :projectId', { projectId })
      .orderBy('participants.created_at', 'ASC');

    if (name) {
      qb.andWhere('LOWER(mission.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    if (status) {
      qb.andWhere('mission.status IN (:...status)', { status });
    }

    if (participant_ids) {
      qb.orWhere('participants.id IN (:...participant_ids)', { participant_ids });
    }

    if (created_by_ids) {
      qb.orWhere('mission.created_by_id IN (:...created_by_ids)', { created_by_ids });
    }

    qb.where('mission.project_id = :projectId', { projectId }).orderBy(
      `mission.${sort_by}`,
      order_by,
      'NULLS LAST'
    );

    return paginateQuery(qb, page, limit);
  }

  async getMissionDetailById(missionId: string) {
    return this.findMissionDetailById(missionId);
  }

  async getAllParticipantById(missionId: string) {
    const mission = await this.findMissionDetailById(missionId);

    return mission.participants;
  }

  async checkParticipantJoinMission(missionId: string, userId: string) {
    await this.userService.findUserById(userId);
    const mission = await this.findMissionDetailById(missionId);

    const user = mission.participants.find((participant) => participant.id === userId);

    if (!user) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('User'));
    }
    return user;
  }

  async createMission(user: User, createMissionDto: CreateMissionDto): Promise<Mission> {
    const { id: createdByMissionId } = user;
    const { project_id, participant_ids, ...createMissionParams } = createMissionDto;

    const project = await this.projectService.findProjectById(project_id);
    const createdByProjectId = project.created_by_id;

    const updatedParticipantIds = Array.from(
      new Set([...participant_ids, createdByProjectId, createdByMissionId])
    );

    const participants = await this.userService.findUserByIds(updatedParticipantIds);

    const createdMission = await this.missionRepository.save({
      ...createMissionParams,
      project_id,
      created_by: user,
      participants,
    });

    return createdMission;
  }

  async updateMissionById(missionId: string, updateMissionDto: UpdateMissionDto): Promise<Mission> {
    const { participant_ids, ...updateMissionParams } = updateMissionDto;

    const mission = await this.findMissionDetailById(missionId);

    if (participant_ids) {
      const projectId = mission.project_id;
      const project = await this.projectService.findProjectById(projectId);
      const createdByProjectId = project.created_by_id;
      const createdByMissionId = mission.created_by_id;

      const updatedParticipantIds = Array.from(
        new Set([...participant_ids, createdByProjectId, createdByMissionId])
      );

      const newParticipants = await this.findParticipantsByIds(updatedParticipantIds);

      await this.missionRepository.save({
        ...mission,
        ...updateMissionParams,
        participants: newParticipants,
      });
    } else {
      await this.missionRepository.save({
        ...mission,
        ...updateMissionParams,
      });
    }

    return this.findMissionDetailById(missionId);
  }

  async findParticipantsByIds(userIds: string[]): Promise<User[]> {
    return this.userService.findUserByIds(userIds);
  }

  async deleteMissionById(missionId: string): Promise<string> {
    const mission = await this.findMissionById(missionId);

    await this.missionRepository.remove(mission);

    return 'Successfully deleted mission';
  }

  async addTotalCostMission(
    missionId: string,
    addTotalCostMissionDto: AddTotalCostMissionDto
  ): Promise<Mission> {
    const { new_cost } = addTotalCostMissionDto;

    await this.missionRepository.increment({ id: missionId }, 'total_cost', new_cost);

    return this.findMissionDetailById(missionId);
  }

  async addUsageCostMission(missionId: string, newUsageCost: number): Promise<Mission> {
    await this.missionRepository.increment({ id: missionId }, 'usage_cost', newUsageCost);

    return this.findMissionDetailById(missionId);
  }
}
