import { ValidatorConstants } from '@/helpers/constants/validator.constant';
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
      // .leftJoinAndSelect('mission.created_by', 'mission_created_by')
      // .leftJoinAndSelect('mission_created_by.avatar', 'mission_create_by_avatar')
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

  async getMissionByProjectId(projectId: string) {
    const missions = await this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.participants', 'participants')
      .leftJoinAndSelect('participants.avatar', 'participant_avatar')
      .where('mission.project_id = :projectId', { projectId })
      .orderBy('participants.created_at', 'ASC')
      .getMany();

    return missions;
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
    const { project_id, participant_ids, ...createMissionParams } = createMissionDto;

    await this.projectService.findProjectById(project_id);

    const participants = participant_ids
      ? await this.userService.findUserByIds(participant_ids)
      : [];

    return this.missionRepository.save({
      ...createMissionParams,
      project_id,
      created_by: user,
      participants,
    });
  }

  async updateMissionById(missionId: string, updateMissionDto: UpdateMissionDto): Promise<Mission> {
    const { participant_ids, ...updateMissionParams } = updateMissionDto;

    const mission = await this.findMissionDetailById(missionId);

    const existingParticipantIds = mission.participants.map((participant) => participant.id);

    const participantsToAdd = participant_ids
      ? await this.findParticipantsByIds(
          participant_ids.filter((id) => !existingParticipantIds.includes(id))
        )
      : [];

    const participantsToDelete = mission.participants.filter(
      (participant) => participant_ids && !participant_ids.includes(participant.id)
    );

    await this.missionRepository.save({
      ...mission,
      ...updateMissionParams,
      participants: [...mission.participants, ...participantsToAdd],
    });

    await this.removeParticipantsFromMission(mission, participantsToDelete);

    return this.findMissionDetailById(missionId);
  }

  async findParticipantsByIds(userIds: string[]): Promise<User[]> {
    return this.userService.findUserByIds(userIds);
  }

  async removeParticipantsFromMission(mission: Mission, participants: User[]): Promise<void> {
    if (participants.length > 0) {
      await this.missionRepository
        .createQueryBuilder()
        .relation(Mission, 'participants')
        .of(mission)
        .remove(participants);
    }
  }

  async deleteMissionById(missionId: string): Promise<string> {
    const mission = await this.findMissionById(missionId);

    await this.missionRepository.remove(mission);

    return 'Deleted mission successfully';
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
