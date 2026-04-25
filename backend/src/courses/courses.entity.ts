import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseModel } from '../shared/base.entity';
import { Users } from '../users/users.entity';
import { Homework } from '../homeworks/homeworks.entity';

@Entity()
export class Course extends BaseModel {
  @Column({ nullable: false, length: 120 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ nullable: false })
  teacherId!: number;

  @Column({ nullable: false, default: false })
  isArchived!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  archivedAt!: Date | null;

  @ManyToOne(() => Users, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Users;

  @OneToMany(() => Homework, (homework) => homework.course)
  homeworks!: Homework[];
}
