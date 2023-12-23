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

  @Get('/all/:projectId')
  @UseGuards(JwtAuthGuard)
  async getMissionByProjectId(@Param('projectId') projectId: string) {
    return this.missionService.getMissionByProjectId(projectId);
  }

  @Get('/detail/:missionId')
  @UseGuards(JwtAuthGuard)
  async getMissionDetailById(@Param('missionId') missionId: string) {
    return this.missionService.getMissionDetailById(missionId);
  }

  @Get('/participant/:missionId')
  @UseGuards(JwtAuthGuard)
  async getAllParticipantById(@Param('missionId') missionId: string) {
    return this.missionService.getAllParticipantById(missionId);
  }

  // @Get('/participant/:missionId/:userId')
  // @UseGuards(JwtAuthGuard)
  // async getParticipantByUserId(
  //   @Param('missionId') missionId: string,
  //   @Param('userId') userId: string
  // ) {
  //   return this.missionService.getParticipantByUserId(missionId, userId);
  // }

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
