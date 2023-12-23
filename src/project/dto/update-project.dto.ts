import { CreateProjectDto } from '@/project/dto/create-project.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
