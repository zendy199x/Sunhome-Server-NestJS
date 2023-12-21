import { FileService } from '@/file/file.service';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  jwtService: any;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private fileService: FileService
  ) {}

  async findUserById(userId: string) {
    return await this.userRepository.findOneBy({
      id: userId,
    });
  }

  async findUserByUsername(userName: string) {
    return await this.userRepository.findOneBy({
      username: userName,
    });
  }

  async addAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (user.avatar) {
      await this.userRepository.update(userId, {
        avatar: null,
      });
      await this.fileService.deletePublicFile(user.avatar.id);
    }

    const avatar = await this.fileService.uploadPublicFile(file);

    const savedAvatar = await this.userRepository.save({ ...user, avatar });

    return savedAvatar;
  }
}
