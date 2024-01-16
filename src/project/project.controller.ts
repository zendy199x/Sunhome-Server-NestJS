import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { CreateProjectDto } from '@/project/dto/create-project.dto';
import { FindProjectDto } from '@/project/dto/find-project.dto';
import { ProjectService } from '@/project/project.service';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProjectList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit,
    @Query() query: FindProjectDto
  ) {
    return this.projectService.getProjectList(page, limit, query);
  }

  @Get('/:projectId')
  @UseGuards(JwtAuthGuard)
  async getProjectById(@Param('projectId') projectId: string) {
    return this.projectService.getProjectDetailById(projectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProject(@GetUser() user: User, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(user, createProjectDto);
  }

  @Patch('/:projectId')
  @UseGuards(JwtAuthGuard)
  async updateProjectById(
    @Param('projectId') projectId: string,
    @Body() createProjectDto: CreateProjectDto
  ) {
    return this.projectService.updateProjectById(projectId, createProjectDto);
  }

  @Delete('/:projectId')
  @UseGuards(JwtAuthGuard)
  async deleteProjectById(@Param('projectId') projectId: string) {
    return this.projectService.deleteProjectById(projectId);
  }
}
