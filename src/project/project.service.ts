import { CreateProjectDto } from '@/project/dto/create-project.dto';
import { Project } from '@/project/entities/project.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async createProject(user: User, createProjectDto: CreateProjectDto) {
    const savedProject = await this.projectRepository.save({
      ...createProjectDto,
      created_by: user,
    });

    return savedProject;
  }
}
