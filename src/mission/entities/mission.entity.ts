import { BaseEntity } from '@/commons/entities/base.entity';
import { MissionStatus } from '@/commons/enums/mission-status.enum';
import { TableDB } from '@/commons/enums/table-db.enum';
import { Project } from '@/project/entities/project.entity';
import { Report } from '@/report/entities/report.entity';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity(TableDB.MISSION)
export class Mission extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'real', default: 0 })
  total_cost: number;

  @Column({ type: 'real', default: 0 })
  usage_cost: number;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.TO_DO,
    nullable: true,
  })
  status: MissionStatus;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  created_by_id: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  project_id: string;

  @ManyToOne(() => User, (user) => user.created_missions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => Project, (project) => project.missions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToMany(() => User, (user) => user.participated_missions, {
    cascade: true,
  })
  @JoinTable({
    name: TableDB.MISSION_PARTICIPANTS,
    joinColumn: { name: 'mission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany(() => Report, (report) => report.mission, {
    cascade: true,
  })
  reports: Report[];
}
