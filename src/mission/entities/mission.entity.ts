import { BaseEntity } from '@/commons/entities/base.entity';
import { MissionStatus } from '@/commons/enums/mission-status.enum';
import { TableDB } from '@/commons/enums/table-db.enum';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity(TableDB.MISSION)
export class Mission extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  describe: string;

  @Column({ type: 'real' })
  total_cost: number;

  @Column({ type: 'real' })
  usage_cost: number;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.TODO,
  })
  status: MissionStatus;

  @Column({
    type: 'uuid',
  })
  created_by_id: string;

  @ManyToOne(() => User, (user) => user.missions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToMany(() => User, (user) => user.missions, {
    cascade: true,
  })
  @JoinTable({
    name: 'mission_participants',
    joinColumn: { name: 'mission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];
}
