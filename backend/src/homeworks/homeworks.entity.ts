import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../shared/base.entity';
import { Course } from '../courses/courses.entity';
import { Assignment } from '../assignments/assignments.entity';

@Entity()
export class Homework extends BaseModel {
  @Column({ nullable: false })
  courseId!: number;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @ManyToOne(() => Course, (course) => course.homeworks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => Assignment, (assignment) => assignment.homework)
  assignments!: Assignment[];
}
