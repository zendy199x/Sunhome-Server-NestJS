import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { UserRole } from '@/commons/enums/user-role.enum';
import { Device } from '@/device/entities/device.entity';
import { File } from '@/file/entities/file.entity';
import { Mission } from '@/mission/entities/mission.entity';
import { Project } from '@/project/entities/project.entity';
import { Report } from '@/report/entities/report.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity(TableDB.USER)
export class User extends BaseEntity {
  @Index('username_idx', { unique: true })
  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  avatar_id: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;

  @OneToOne(() => File, (file) => file.avatar, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'avatar_id' })
  avatar: File;

  @OneToMany(() => Project, (project) => project.created_by)
  created_projects: Project[];

  @OneToMany(() => Mission, (mission) => mission.created_by)
  created_missions: Mission[];

  @ManyToMany(() => Mission, (mission) => mission.participants)
  participated_missions: Mission[];

  @ManyToMany(() => Device, (device) => device.users)
  user_devices: Device[];

  @OneToMany(() => Report, (report) => report.sender)
  sent_reports: Report[];

  @OneToMany(() => Report, (report) => report.mission)
  reports: Report[];
}
