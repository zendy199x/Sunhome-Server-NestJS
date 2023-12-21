import { File } from '@/file/entities/file.entity';
import { FileService } from '@/file/file.service';
import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPublicFile(@UploadedFile() file: Express.Multer.File): Promise<File> {
    return this.fileService.uploadPublicFile(file);
  }

  @Post('/upload/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiplePublicFile(
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Array<File>> {
    return this.fileService.uploadMultiplePublicFile(files);
  }
}
