import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/auth/dto/create-user.dto';
import { PublicFileValidatorInterceptor } from '@/interceptors/public-file-validator.interceptor';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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
}
