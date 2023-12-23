import { AddTotalCostMissionDto } from './dto/add-total-cost-mission.dto';
import { UserService } from '@/user/user.service';
import { CreateMissionDto } from '@/mission/dto/create-mission.dto';
import { Mission } from '@/mission/entities/mission.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectService } from '@/project/project.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';

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

  async findMissionDetailById(missionId: string) {
    const mission = await this.missionRepository
      .createQueryBuilder('mission')
      // .leftJoinAndSelect('mission.created_by', 'mission_created_by')
      // .leftJoinAndSelect('mission_created_by.avatar', 'mission_create_by_avatar')
      .leftJoinAndSelect('mission.participants', 'participants')
      .leftJoinAndSelect('participants.avatar', 'participant_avatar')
      .where('mission.id = :missionId', { missionId })
      .getOne();

    if (!mission) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Mission'));
    }
    return mission;
  }

  async createMission(user: User, createMissionDto: CreateMissionDto) {
    const { project_id, participant_ids, ...createMissionParams } = createMissionDto;

    await this.projectService.findProjectById(project_id);

    const participants = participant_ids
      ? await this.userService.findUserByIds(participant_ids)
      : [];

    const savedMission = await this.missionRepository.save({
      ...createMissionParams,
      project_id,
      created_by: user,
      participants,
    });

    return savedMission;
  }

  async deleteMissionById(missionId: string) {
    const mission = await this.findMissionById(missionId);

    await this.missionRepository.remove(mission);

    return 'Deleted mission successfully';
  }

  async addTotalCostMission(addTotalCostMissionDto: AddTotalCostMissionDto) {
    const { mission_id, new_cost } = addTotalCostMissionDto;

    const mission = await this.findMissionById(mission_id);

    const totalCost = mission.total_cost + new_cost;

    await this.missionRepository.save({
      ...mission,
      total_cost: totalCost,
    });

    return this.findMissionDetailById(mission_id);
  }
}
