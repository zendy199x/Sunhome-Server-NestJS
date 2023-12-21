import { File } from '@/file/entities/file.entity';
import { FileController } from '@/file/file.controller';
import { FileService } from '@/file/file.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
