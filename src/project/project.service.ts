import { FindProjectDto } from '@/project/dto/find-project.dto';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from '@/project/dto/create-project.dto';
import { Project } from '@/project/entities/project.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

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
      .leftJoinAndSelect('project.missions', 'missions')
      // .leftJoinAndSelect('project.created_by', 'project_created_by')
      // .leftJoinAndSelect('project_created_by.avatar', 'project_created_by_avatar')
      .leftJoinAndSelect('missions.participants', 'participants')
      // .leftJoinAndSelect('missions.created_by', 'mission_created_by')
      // .leftJoinAndSelect('mission_created_by.avatar', 'mission_created_by_avatar')
      .leftJoinAndSelect('participants.avatar', 'participant_avatar')
      .orderBy('missions.created_at', 'ASC')
      .where('project.id = :projectId', { projectId })
      .getOne();

    if (!project) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('Project'));
    }

    return project;
  }

  async getProjectList(page: number, limit: number, query: FindProjectDto) {
    const { name, status, created_by_ids, sort_by, order_by } = query;

    let qb = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.missions', 'missions')
      .leftJoinAndSelect('project.created_by', 'project_created_by')
      .leftJoinAndSelect('project_created_by.avatar', 'project_created_by_avatar')
      .leftJoinAndSelect('missions.participants', 'participants')
      .leftJoinAndSelect('missions.created_by', 'mission_created_by')
      .leftJoinAndSelect('mission_created_by.avatar', 'mission_created_by_avatar')
      .leftJoinAndSelect('participants.avatar', 'participant_avatar');

    if (name) {
      qb.where('(LOWER(project.name) LIKE LOWER(:name))', {
        name: `%${name}%`,
      });
    }

    if (status) {
      qb.andWhere('project.status IN (:...status)', { status });
    }

    if (created_by_ids) {
      qb.andWhere('project.created_by_id IN (:...created_by_ids)', { created_by_ids });
    }

    qb.orderBy(`project.${sort_by}`, order_by, 'NULLS LAST').orderBy('missions.created_at', 'ASC');

    return paginate<Project>(qb, { page, limit });
  }

  async createProject(user: User, createProjectDto: CreateProjectDto) {
    const savedProject = await this.projectRepository.save({
      ...createProjectDto,
      created_by: user,
    });

    return savedProject;
  }

  async updateProjectById(projectId: string, updateProjectDto: UpdateProjectDto) {
    let { ...updateProjectParams } = updateProjectDto;

    const project = await this.findProjectById(projectId);

    await this.projectRepository.save({
      ...project,
      updateProjectParams,
    });

    return this.findProjectDetailById(projectId);
  }

  async deleteProjectById(projectId: string) {
    const project = await this.findProjectById(projectId);

    await this.projectRepository.remove(project);

    return 'Deleted project successfully';
  }
}
