import { Project } from '@/project/entities/project.entity';
import { ProjectController } from '@/project/project.controller';
import { ProjectService } from '@/project/project.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
