import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { File } from '@/file/entities/file.entity';
import { FileService } from '@/file/file.service';
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('File')
@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPublicFile(@UploadedFile() file: Express.Multer.File): Promise<File> {
    return this.fileService.uploadSingleFile(file);
  }

  @Post('/upload/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiplePublicFile(
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Array<File>> {
    return this.fileService.uploadMultipleFile(files);
  }
}
