import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { CreateProjectDto } from '@/project/dto/create-project.dto';
import { ProjectService } from '@/project/project.service';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

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
    return this.projectService.updateProject(projectId, createProjectDto);
  }

  @Get('/:projectId')
  @UseGuards(JwtAuthGuard)
  async getProjectById(@Param('projectId') projectId: string) {
    return this.projectService.findProjectDetailById(projectId);
  }
}
