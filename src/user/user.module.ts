import { File } from '@/file/entities/file.entity';
import { FileModule } from '@/file/file.module';
import { Mission } from '@/mission/entities/mission.entity';
import { User } from '@/user/entities/user.entity';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, File, Mission]), FileModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
