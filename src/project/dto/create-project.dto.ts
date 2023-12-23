import { ProjectStatus } from '@/commons/enums/project-status.enum';
import { IsEnum, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
