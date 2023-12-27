import { TableDB } from '@/commons/enums/table-db.enum';
import { BaseDeviceDto } from '@/device/dto/base-device.dto';
import { Device } from '@/device/entities/device.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>
  ) {}

  async saveUserDevice(user: User, baseDeviceDto: BaseDeviceDto) {
    const { fcm_token } = baseDeviceDto;

    const device = await this.deviceRepository.findOne({
      where: { fcm_token },
      relations: { users: true },
    });
    if (!device) {
      return this.deviceRepository.save({ ...baseDeviceDto, users: [user] });
    }
    device.users.push(user);
    return this.deviceRepository.save(device);
  }

  async removeUserDevice(userId: string, fcmToken: string) {
    const device = await this.deviceRepository.findOne({
      where: { fcm_token: fcmToken },
      relations: { users: true },
    });

    device.users = device.users.filter((user) => user.id !== userId);
    return this.deviceRepository.save(device);
  }

  async removeDeviceByFcmToken(fcmToken: string) {
    await this.deviceRepository
      .createQueryBuilder('device')
      .delete()
      .where('device.fcm_token = :fcmToken', { fcmToken })
      .execute();
  }

  async removeInvalid(fcmToken: string) {
    return this.deviceRepository.delete({ fcm_token: fcmToken });
  }

  async findByUserId(userId: string) {
    return this.deviceRepository
      .createQueryBuilder('device')
      .innerJoin(TableDB.USER_DEVICE, 'user_device', 'user_device.device_id = device.id')
      .where('user_device.userId = :userId', { userId })
      .getMany();
  }
}
