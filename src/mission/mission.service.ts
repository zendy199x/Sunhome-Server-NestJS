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
}
