import { Module } from '@nestjs/common';
import { MissionService } from '@/mission/mission.service';
import { MissionController } from '@/mission/mission.controller';

@Module({
  controllers: [MissionController],
  providers: [MissionService],
})
export class MissionModule {}
