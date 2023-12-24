import { BaseEntity } from '@/commons/entities/base.entity';
import { ProjectStatus } from '@/commons/enums/project-status.enum';
import { TableDB } from '@/commons/enums/table-db.enum';
import { Mission } from '@/mission/entities/mission.entity';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity(TableDB.PROJECT)
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.TO_DO,
  })
  status: ProjectStatus;

  @Column({
    type: 'uuid',
  })
  created_by_id: string;

  @ManyToOne(() => User, (user) => user.created_projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @OneToMany(() => Mission, (mission) => mission.project)
  missions: Mission[];
}
