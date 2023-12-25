import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { Report } from '@/report/entities/report.entity';
import { User } from '@/user/entities/user.entity';
import { IsNumber } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity(TableDB.FILE)
export class File extends BaseEntity {
  @Column('text')
  url: string;

  @Column()
  key: string;

  @Column()
  @IsNumber()
  size: number;

  @Column()
  type: string;

  @Column()
  file_name: string;

  @Column({ nullable: true })
  report_file_order: number;

  @Column({ type: 'uuid', nullable: true })
  report_id: string;

  @OneToOne(() => User, (user) => user.avatar, {
    onDelete: 'CASCADE',
  })
  avatar: User;

  @ManyToOne(() => Report, (report) => report.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;
}
