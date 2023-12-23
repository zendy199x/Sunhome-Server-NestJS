import { Module } from '@nestjs/common';
import { MissionService } from '@/mission/mission.service';
import { MissionController } from '@/mission/mission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@/project/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [MissionController],
  providers: [MissionService],
})
export class MissionModule {}
