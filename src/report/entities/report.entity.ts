import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { File } from '@/file/entities/file.entity';
import { Mission } from '@/mission/entities/mission.entity';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity(TableDB.REPORT)
export class Report extends BaseEntity {
  @Column({ type: 'uuid' })
  mission_id: string;

  @Column({ type: 'real', default: 0, nullable: true })
  new_usage_cost: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @ManyToOne(() => Mission, (mission) => mission.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @ManyToOne(() => User, (user) => user.sent_reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @OneToMany(() => File, (file) => file.report, {
    cascade: true,
  })
  files: File[];
}
