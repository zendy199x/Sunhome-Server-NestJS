import { CreateUserDto } from '@/auth/dto/create-user.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { PostgresErrorCode } from '@/commons/enums/postgres-error-code.enum';
import { ValidatorConstants } from '@/helpers/constants/validator.constant';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { IJwtPayload } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
    private userService: UserService
  ) {}

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  async signUp(createUserDto: CreateUserDto, avatar: Express.Multer.File) {
    const { username, password, role } = createUserDto;

    // Delete user that is deactivated before create
    const user = await this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });

    if (!!user?.deleted_at) {
      await this.userRepository.delete(user.id);
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(createdUser);

      if (avatar) {
        await this.userService.addAvatar(savedUser.id, avatar);
      }

      const user = await this.userService.findUserByUsername(username);

      return user;
    } catch (error) {
      // Duplicate user
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto) {
    try {
      const { username, password } = authCredentialsDto;

      const user: User = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.avatar', 'avatar')
        .select(['user', 'avatar'])
        .addSelect('user.password')
        .where('user.username = :username', { username })
        .getOne();

      if (!user) {
        throw new NotFoundException(ValidatorConstants.NOT_FOUND('User'));
      }

      await this.verifyPassword(password, user.password);

      const payload: IJwtPayload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      const accessToken: string = await this.jwtService.sign(payload);

      return {
        profile: {
          ...user,
        },
        access_token: accessToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { username, newPassword } = resetPasswordDto;

    const user: User = await this.userService.findUserByUsername(username);

    if (!user) {
      throw new NotFoundException(ValidatorConstants.NOT_FOUND('User'));
    }

    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepository.save({
      ...user,
      password: hashedNewPassword,
    });

    return this.userService.getDetailUserByUserId(user.id);
  }
}
