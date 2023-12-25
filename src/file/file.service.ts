import { File } from '@/file/entities/file.entity';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,

    private configService: ConfigService
  ) {}

  async uploadSingleFile(file: Express.Multer.File): Promise<File> {
    const { buffer, originalname, size, mimetype } = file;

    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_NAME'),
        Body: buffer,
        Key: `${uuid()}-${originalname}`,
        ContentType: mimetype,
      })
      .promise();

    const newFile = await this.fileRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
      size,
      type: mimetype,
      file_name: originalname,
    });
    await this.fileRepository.save(newFile);

    return newFile;
  }

  async uploadMultipleFile(files: Array<Express.Multer.File>): Promise<Array<File>> {
    const promiseUploadFile = files.map((file) => this.uploadSingleFile(file));

    return await Promise.all(promiseUploadFile);
  }

  async deletePublicFile(fileId: string) {
    const file = await this.fileRepository.findOneBy({ id: fileId });

    if (!file) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('File'));
    }

    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();

    await this.fileRepository.delete(fileId);
  }

  async uploadFileReportRecord(fileUploaded: File, reportId: string, reportOrder: number) {
    return await this.fileRepository.save({
      ...fileUploaded,
      report_id: reportId,
      report_file_order: reportOrder,
    });
  }
}
