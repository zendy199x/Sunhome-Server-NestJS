import { FileService } from '@/file/file.service';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { paginateQuery } from '@/helpers/pagination-qb.helper';
import { FilterUserListDto } from '@/user/dto/filter-user-list.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { User } from '@/user/entities/user.entity';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';

@Injectable()
export class UserService {
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

  async findUserByIds(userIds: Array<string>) {
    const users = await this.userRepository.findBy({ id: In(userIds) });

    return users;
  }

  async getUserDetailByUserId(userId: string) {
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

  async addAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findUserById(userId);
    const avatarId = user.avatar_id;

    if (avatarId) {
      await this.userRepository.update(userId, { avatar: null });
      await this.fileService.deletePublicFile(avatarId);
    }

    const avatar = await this.fileService.uploadSingleFile(file);
    await this.userRepository.save({ ...user, avatar });

    return this.getUserDetailByUserId(userId);
  }

  async deleteAvatar(userId: string): Promise<User> {
    const user = await this.findUserById(userId);
    const avatarId = user.avatar_id;

    if (avatarId) {
      await this.userRepository.update(userId, { avatar: null });
      await this.fileService.deletePublicFile(avatarId);
    }

    return this.getUserDetailByUserId(userId);
  }

  async getAllUser(query: FilterUserListDto): Promise<User[]> {
    const { username, roles, orderBy } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar');

    if (username) {
      qb.andWhere('LOWER(user.username) LIKE LOWER(:username)', { username: `%${username}%` });
    }

    if (roles) {
      qb.andWhere('user.role IN (:...roles)', { roles });
    }

    if (orderBy) {
      qb.orderBy('user.created_at', orderBy);
    }

    return qb.getMany();
  }

  async getUserList(page: number, limit: number, query: FilterUserListDto): Promise<any> {
    const { username, roles, orderBy } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar');

    if (username) {
      qb.andWhere('LOWER(user.username) LIKE LOWER(:username)', { username: `%${username}%` });
    }

    if (roles) {
      qb.andWhere('user.role IN (:...roles)', { roles });
    }

    if (orderBy) {
      qb.orderBy('user.created_at', orderBy);
    }

    return paginateQuery(qb, page, limit);
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    const { id: userId, username: userUsername } = user;
    const { username, password, role } = updateUserDto;
    const updateUserParams: Record<string, any> = {};

    if (username && username !== userUsername) {
      const existingUser = await this.findUserByUsername(username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
      updateUserParams.username = username;
    }

    if (role) {
      updateUserParams.role = role;
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedNewPassword = await bcrypt.hash(password, salt);
      updateUserParams.password = hashedNewPassword;
    }

    await this.userRepository.update(userId, updateUserParams);

    return this.getUserDetailByUserId(userId);
  }
}
