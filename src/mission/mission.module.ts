import { Mission } from '@/mission/entities/mission.entity';
import { MissionController } from '@/mission/mission.controller';
import { MissionService } from '@/mission/mission.service';
import { ProjectModule } from '@/project/project.module';
import { User } from '@/user/entities/user.entity';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, User]), UserModule, ProjectModule],
  controllers: [MissionController],
  providers: [MissionService],
})
export class MissionModule {}
