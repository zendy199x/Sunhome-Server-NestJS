import { TableDB } from '@/commons/enums/table-db.enum';
import { UserRole } from '@/commons/enums/user-role.enum';
import { File } from '@/file/entities/file.entity';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, DeleteDateColumn, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

@Entity(TableDB.USER)
export class User extends BaseEntity {
  @Index('username_idx', { unique: true })
  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;

  @OneToOne(() => File, (file) => file.avatar, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'avatar_id' })
  avatar: File;
}
