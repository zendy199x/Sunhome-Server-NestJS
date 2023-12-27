import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { Column, Entity } from 'typeorm';

@Entity(TableDB.PUSH_NOTIFICATION)
export class PushNotification extends BaseEntity {
  @Column()
  status: number;

  @Column({ nullable: true })
  notification_title: string;

  @Column({ type: 'text', nullable: true })
  notification_body: string;

  @Column({ nullable: true })
  device_token: string;

  @Column({ nullable: true })
  topic: string;

  @Column({ nullable: true })
  data: string;
}
