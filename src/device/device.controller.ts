import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/decorators/get-user.decorator';
import { DeviceService } from '@/device/device.service';
import { BaseDeviceDto } from '@/device/dto/base-device.dto';
import { User } from '@/user/entities/user.entity';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Devices')
@Controller('device')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  saveUserDevice(@GetUser() user: User, @Body() baseDeviceDto: BaseDeviceDto) {
    return this.deviceService.saveUserDevice(user, baseDeviceDto);
  }
}
