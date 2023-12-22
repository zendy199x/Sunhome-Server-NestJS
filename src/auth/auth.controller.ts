import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/auth/dto/create-user.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PublicFileValidatorInterceptor } from '@/interceptors/public-file-validator.interceptor';
import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @UseInterceptors(
    FileInterceptor('avatar'),
    new PublicFileValidatorInterceptor(
      [/^image\/(?:jpg|jpeg|png|webp|gif|bmp|svg\+xml)$/i],
      'Only images are allowed',
      false
    )
  )
  signUp(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile()
    avatar: Express.Multer.File
  ) {
    return this.authService.signUp(createUserDto, avatar);
  }

  @Post('/sign-in')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
