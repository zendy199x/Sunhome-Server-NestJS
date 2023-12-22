import { FileService } from '@/file/file.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { FilterUserListDto } from '@/user/dto/filter-user-list.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { User } from '@/user/entities/user.entity';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { paginate } from 'nestjs-typeorm-paginate';
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
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('User'));
    }
    return user;
  }

  async findUserByUsername(userName: string) {
    const user = await this.userRepository.findOneBy({
      username: userName,
    });

    if (!user) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('User'));
    }
    return user;
  }

  async getDetailUserByUserId(userId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('User'));
    }

    return user;
  }

  async addAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.findUserById(userId);

    const avatarId = user.avatar_id;

    if (avatarId) {
      await this.userRepository.update(userId, {
        avatar: null,
      });
      await this.fileService.deletePublicFile(avatarId);
    }

    const avatar = await this.fileService.uploadPublicFile(file);
    await this.userRepository.save({
      ...user,
      avatar,
    });

    return this.getDetailUserByUserId(userId);
  }

  async deleteAvatar(userId: string) {
    const user = await this.findUserById(userId);
    const avatarId = user.avatar_id;

    if (avatarId) {
      await this.userRepository.update(userId, {
        avatar: null,
      });
      await this.fileService.deletePublicFile(avatarId);
    }

    return this.getDetailUserByUserId(userId);
  }

  async getAllUser(query: FilterUserListDto) {
    const { username, role, orderBy } = query;

    const qb = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar');

    if (username) {
      qb.andWhere('(LOWER(user.username) LIKE LOWER(:username))', {
        username: `%${username}%`,
      });
    }

    if (role) {
      qb.andWhere('user.role IN (:...role)', { role });
    }

    if (orderBy) {
      qb.orderBy('user.createdAt', orderBy);
    }

    return qb.getMany();
  }

  async getUserList(page: number, limit: number, query: FilterUserListDto) {
    const { username, role, orderBy } = query;

    const qb = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar');

    if (username) {
      qb.andWhere('(LOWER(user.username) LIKE LOWER(:username))', {
        username: `%${username}%`,
      });
    }

    if (role) {
      qb.andWhere('user.role IN (:...role)', { role });
    }

    if (orderBy) {
      qb.orderBy('user.createdAt', orderBy);
    }

    return paginate<User>(qb, { page, limit });
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto) {
    const { id: userId, username: userUsername } = user;

    const { username, password, role } = updateUserDto;
    let { ...paramsToUpdate } = updateUserDto;

    if (username && username !== userUsername) {
      const user = await this.findUserByUsername(username);

      if (user) {
        throw new ConflictException('Email already exists');
      }
    }

    if (username) {
      paramsToUpdate = {
        ...paramsToUpdate,
        username,
      };
    }

    if (role) {
      paramsToUpdate = {
        ...paramsToUpdate,
        role,
      };
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedNewPassword = await bcrypt.hash(password, salt);

      paramsToUpdate = {
        ...paramsToUpdate,
        password: hashedNewPassword,
      };
    }

    await this.userRepository.update(userId, paramsToUpdate);

    return this.getDetailUserByUserId(userId);
  }
}
