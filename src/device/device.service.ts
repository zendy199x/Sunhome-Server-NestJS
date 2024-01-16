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

    try {
      let device = await this.deviceRepository.findOne({
        where: { fcm_token },
        relations: { users: true },
      });

      if (!device) {
        device = this.deviceRepository.create({ ...baseDeviceDto, users: [user] });
        await this.deviceRepository.save(device);
        return 'Successfully added FCM Token';
      }

      const userExists = device.users.some((u) => u.id === user.id);

      if (!userExists) {
        device.users.push(user);
        await this.deviceRepository.save(device);
        return 'Successfully added FCM Token';
      } else {
        return 'FCM Token is already associated with the user';
      }
    } catch (error) {
      console.error('Error while adding FCM Token:', error.message);
      throw error;
    }
  }

  async removeUserDevice(userId: string, fcmToken: string) {
    const device = await this.deviceRepository.findOne({
      where: { fcm_token: fcmToken },
      relations: { users: true },
    });

    if (!device) {
      return 'Specified FCM Token not found';
    }

    device.users = device.users.filter((user) => user.id !== userId);
    await this.deviceRepository.save(device);

    return 'User is removed from the specified FCM Token';
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

  async getFcmTokenByUserId(userId: string) {
    return this.deviceRepository
      .createQueryBuilder('device')
      .innerJoin(TableDB.USER_DEVICE, 'user_device', 'user_device.device_id = device.id')
      .where('user_device.user_id = :userId', { userId })
      .getMany();
  }

  async removeFcmToken(user: User, fcmToken: string) {
    const { id: userId } = user;

    return await this.removeUserDevice(userId, fcmToken);
  }
}
