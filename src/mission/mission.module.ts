import { Mission } from '@/mission/entities/mission.entity';
import { MissionController } from '@/mission/mission.controller';
import { MissionService } from '@/mission/mission.service';
import { ProjectModule } from '@/project/project.module';
import { Report } from '@/report/entities/report.entity';
import { User } from '@/user/entities/user.entity';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, User, Report]), UserModule, ProjectModule],
  controllers: [MissionController],
  providers: [MissionService],
})
export class MissionModule {}
