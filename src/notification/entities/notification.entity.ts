import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity(TableDB.NOTIFICATION)
export class Notification extends BaseEntity {
  @Column()
  type: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  object_type: string;

  @Column({ type: 'uuid', nullable: true })
  object_id: string;

  @Column({ type: 'uuid', nullable: true })
  related_object_id: string;

  @Column({ type: 'uuid' })
  actor_id: string;

  @Column({ type: 'uuid' })
  target_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id', referencedColumnName: 'id' })
  actor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
  target: User;

  @Column({ type: 'timestamptz', nullable: true })
  read_at: Date;
}
