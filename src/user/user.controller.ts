import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { PublicFileValidatorInterceptor } from '@/interceptors/public-file-validator.interceptor';
import { User } from '@/user/entities/user.entity';
import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar'),
    new PublicFileValidatorInterceptor(
      [/^image\/(?:jpg|jpeg|png|webp|gif|bmp|svg\+xml)$/i],
      'Only images are allowed',
      false
    )
  )
  async addAvatar(
    @GetUser() user: User,
    @UploadedFile()
    avatar: Express.Multer.File
  ) {
    const { id: userId } = user;

    return this.userService.addAvatar(userId, avatar);
  }
}
