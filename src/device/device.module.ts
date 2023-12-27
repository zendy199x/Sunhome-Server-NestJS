import { DeviceController } from '@/device/device.controller';
import { DeviceService } from '@/device/device.service';
import { Device } from '@/device/entities/device.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
