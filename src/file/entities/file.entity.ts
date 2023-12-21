import { BaseEntity } from '@/commons/entities/base.entity';
import { TableDB } from '@/commons/enums/table-db.enum';
import { User } from '@/user/entities/user.entity';
import { IsNumber } from 'class-validator';
import { Column, Entity, OneToOne } from 'typeorm';

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

  @OneToOne(() => User, (user) => user.avatar, {
    onDelete: 'CASCADE',
  })
  avatar: User;
}
