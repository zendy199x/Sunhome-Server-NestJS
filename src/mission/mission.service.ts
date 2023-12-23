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
    return this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['participants', 'participants.avatar'],
    });
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

    const participants = participant_ids
      ? await this.userService.findUserByIds(participant_ids)
      : [];

    await this.missionRepository.update(
      { id: missionId },
      {
        ...updateMissionParams,
        participants,
      }
    );

    return this.findMissionDetailById(missionId);
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
}
