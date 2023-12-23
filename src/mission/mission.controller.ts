import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { AddTotalCostMissionDto } from '@/mission/dto/add-total-cost-mission.dto';
import { CreateMissionDto } from '@/mission/dto/create-mission.dto';
import { UpdateMissionDto } from '@/mission/dto/update-mission.dto';
import { MissionService } from '@/mission/mission.service';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get('/:missionId')
  @UseGuards(JwtAuthGuard)
  async getMissionById(@Param('missionId') missionId: string) {
    return this.missionService.getMissionById(missionId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMission(@GetUser() user: User, @Body() createMissionDto: CreateMissionDto) {
    return this.missionService.createMission(user, createMissionDto);
  }

  @Patch('/:missionId')
  @UseGuards(JwtAuthGuard)
  async updateMissionById(
    @Param('missionId') missionId: string,
    @Body() updateMissionDto: UpdateMissionDto
  ) {
    return this.missionService.updateMissionById(missionId, updateMissionDto);
  }

  @Post('/add-total-cost/:missionId')
  @UseGuards(JwtAuthGuard)
  async addTotalCost(
    @Param('missionId') missionId: string,
    @Body() addTotalCostMissionDto: AddTotalCostMissionDto
  ) {
    return this.missionService.addTotalCostMission(missionId, addTotalCostMissionDto);
  }

  @Delete('/:missionId')
  @UseGuards(JwtAuthGuard)
  async deleteProjectById(@Param('missionId') missionId: string) {
    return this.missionService.deleteMissionById(missionId);
  }
}
