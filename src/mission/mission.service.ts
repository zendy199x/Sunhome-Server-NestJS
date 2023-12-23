import { UserService } from '@/user/user.service';
import { CreateMissionDto } from '@/mission/dto/create-mission.dto';
import { Mission } from '@/mission/entities/mission.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,

    private userService: UserService
  ) {}

  async createMission(user: User, createMissionDto: CreateMissionDto) {
    const { participantIds, ...createMissionParams } = createMissionDto;

    const participants = participantIds ? await this.userService.findUserByIds(participantIds) : [];

    const savedMission = await this.missionRepository.save({
      ...createMissionParams,
      created_by: user,
      participants,
    });

    return savedMission;
  }
}
