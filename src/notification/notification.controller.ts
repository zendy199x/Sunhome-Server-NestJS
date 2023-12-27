import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { FindAllNotificationDto } from '@/notification/dto/find-all-notification.dto';
import { NotificationService } from '@/notification/notification.service';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAllNotification(
    @GetUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit,
    @Query() query: FindAllNotificationDto
  ) {
    return this.notificationService.findAllNotification({
      user,
      page,
      limit,
      query,
    });
  }

  @Get('/unread-count')
  getUnreadAmount(@GetUser() user: User, @Query() query: FindAllNotificationDto) {
    return this.notificationService.getUnreadAmount(user, query);
  }

  @Put('/view-all')
  markAllNotificationAsView(
    @GetUser() user: User,
    @Body() markAllNotificationDto: FindAllNotificationDto
  ) {
    return this.notificationService.markAllNotificationAsRead(user, markAllNotificationDto);
  }

  @Post('/:notificationId')
  markNotificationAsRead(@GetUser() user: User, @Param('notificationId') notificationId: string) {
    return this.notificationService.markNotificationAsRead(user, notificationId);
  }

  @Delete('/:notificationId')
  removeNotification(@Param('notificationId') notificationId: string) {
    return this.notificationService.removeNotification(notificationId);
  }
}
