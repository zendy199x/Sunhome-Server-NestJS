import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { DeviceService } from '@/device/device.service';
import { BaseDeviceDto } from '@/device/dto/base-device.dto';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Devices')
@Controller('device')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getFcmToken(@GetUser() user: User) {
    const { id: userId } = user;
    return this.deviceService.getFcmTokenByUserId(userId);
  }

  @Get('/:userId')
  getFcmTokenByUserId(@Param('userId') userId: string) {
    return this.deviceService.getFcmTokenByUserId(userId);
  }

  @Post()
  saveUserDevice(@GetUser() user: User, @Body() baseDeviceDto: BaseDeviceDto) {
    return this.deviceService.saveUserDevice(user, baseDeviceDto);
  }

  @Delete('/:fcmToken')
  @UseGuards(JwtAuthGuard)
  removeFcmToken(@GetUser() user: User, @Param('fcmToken') fcmToken: string) {
    return this.deviceService.removeFcmToken(user, fcmToken);
  }
}
