import { Mission } from '@/mission/entities/mission.entity';
import { MissionController } from '@/mission/mission.controller';
import { MissionService } from '@/mission/mission.service';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Mission]), UserModule],
  controllers: [MissionController],
  providers: [MissionService],
})
export class MissionModule {}
