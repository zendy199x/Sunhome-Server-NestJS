import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { CreateMissionDto } from '@/mission/dto/create-mission.dto';
import { MissionService } from '@/mission/mission.service';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMission(@GetUser() user: User, @Body() createMissionDto: CreateMissionDto) {
    return this.missionService.createMission(user, createMissionDto);
  }
}
