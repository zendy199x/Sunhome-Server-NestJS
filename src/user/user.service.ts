import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  jwtService: any;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
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
}
