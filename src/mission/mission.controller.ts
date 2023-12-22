import { MissionService } from '@/mission/mission.service';
import { Controller } from '@nestjs/common';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}
}
