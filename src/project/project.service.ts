import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from '@/project/dto/create-project.dto';
import { Project } from '@/project/entities/project.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async findProjectById(projectId: string) {
    const project = await this.projectRepository.findOneBy({ id: projectId });

    if (!project) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Project'));
    }
    return project;
  }

  async findProjectDetailById(projectId: string) {
    const project = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.created_by', 'created_by')
      .leftJoinAndSelect('project.missions', 'missions')
      .orderBy('missions.created_at', 'ASC')
      .where('project.id = :projectId', { projectId })
      .getOne();

    if (!project) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Project'));
    }

    return project;
  }

  async createProject(user: User, createProjectDto: CreateProjectDto) {
    const savedProject = await this.projectRepository.save({
      ...createProjectDto,
      created_by: user,
    });

    return savedProject;
  }

  async updateProject(projectId: string, updateProjectDto: UpdateProjectDto) {
    let { ...paramsToUpdate } = updateProjectDto;

    const project = await this.findProjectById(projectId);

    await this.projectRepository.save({
      ...project,
      paramsToUpdate,
    });

    return this.findProjectDetailById(projectId);
  }
}
