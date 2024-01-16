import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity(TableDB.DEVICE)
export class Device extends BaseEntity {
  @Column({ unique: true })
  fcm_token: string;

  @ManyToMany(() => User, (user) => user.user_devices, {
    cascade: true,
  })
  @JoinTable({
    name: TableDB.USER_DEVICE,
    joinColumn: { name: 'device_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
