import { UserService } from '@/user/user.service';
import { CreateMissionDto } from '@/mission/dto/create-mission.dto';
import { Mission } from '@/mission/entities/mission.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectService } from '@/project/project.service';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,

    private userService: UserService,
    private projectService: ProjectService
  ) {}

  async createMission(user: User, createMissionDto: CreateMissionDto) {
    const { project_id, participantIds, ...createMissionParams } = createMissionDto;

    await this.projectService.findProjectById(project_id);

    const participants = participantIds ? await this.userService.findUserByIds(participantIds) : [];

    const savedMission = await this.missionRepository.save({
      ...createMissionParams,
      created_by: user,
      participants,
    });

    return savedMission;
  }
}
