import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { PublicFileValidatorInterceptor } from '@/interceptors/public-file-validator.interceptor';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { FilterUserListDto } from './dto/filter-user-list.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar'),
    new PublicFileValidatorInterceptor(
      [/^image\/(jpg|jpeg|png|gif|webp)$/i],
      'Only JPG, JPEG, PNG, GIF and WEBP file are allowed.',
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

  @Delete('/avatar')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(@GetUser() user: User) {
    const { id: userId } = user;

    return this.userService.deleteAvatar(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserDetail(@GetUser() user: User) {
    const { id: userId } = user;
    return this.userService.getDetailUserByUserId(userId);
  }

  @Get('/list')
  @UseGuards(JwtAuthGuard)
  getUserList(@Query() query: FilterUserListDto) {
    return this.userService.getUserList(query);
  }

  @Get('/:userId')
  getUserById(@Param('userId') userId: string) {
    return this.userService.getDetailUserByUserId(userId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateUser(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(user, updateUserDto);
  }
}
