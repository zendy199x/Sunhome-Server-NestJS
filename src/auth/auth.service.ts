import { AuthCredentialsDto } from '@/auth/dto/auth-credentials.dto';
import { CreateUserDto } from '@/auth/dto/create-user.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { IJwtPayload } from '@/auth/interfaces/auth.interfaces';
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
    const { username, password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });

    if (!!user?.deleted_at) {
      await this.userRepository.delete(user.id);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const savedUser = await this.userRepository.save({
        ...createUserDto,
        password: hashedPassword,
      });

      if (avatar) {
        await this.userService.addAvatar(savedUser.id, avatar);
      }

      const user = await this.userService.findUserByUsername(username);

      return user;
    } catch (error) {
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

    return this.userService.getUserDetailByUserId(user.id);
  }
}
