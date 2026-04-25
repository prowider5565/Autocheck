import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../shared/base.entity';
import { Homework } from '../homeworks/homeworks.entity';
import { Users } from '../users/users.entity';

export enum AssignmentSourceType {
  TEXT = 'text',
  IMAGE = 'image',
  TXT_FILE = 'txt_file',
}

export enum AssignmentStatus {
  PROCESSING = 'processing',
  REVIEW_PENDING = 'review_pending',
  GRADED = 'graded',
}

@Entity()
export class Assignment extends BaseModel {
  @Column({ nullable: false })
  homeworkId!: number;

  @Column({ nullable: false })
  studentId!: number;

  @Column({ nullable: false })
  attemptNumber!: number;

  @Column({
    type: 'enum',
    enum: AssignmentSourceType,
    nullable: false,
  })
  sourceType!: AssignmentSourceType;

  @Column({ type: 'text', nullable: true })
  originalText!: string | null;

  @Column({ type: 'text', nullable: false })
  extractedText!: string;

  @Column({ type: 'text', nullable: true })
  filePath!: string | null;

  @Column({ type: 'text', nullable: true })
  fileName!: string | null;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    nullable: false,
    default: AssignmentStatus.PROCESSING,
  })
  status!: AssignmentStatus;

  @Column({ type: 'float', nullable: true })
  geminiScore!: number | null;

  @Column({ type: 'text', nullable: true })
  geminiFeedback!: string | null;

  @Column({ type: 'float', nullable: true })
  finalScore!: number | null;

  @Column({ type: 'text', nullable: true })
  finalFeedback!: string | null;

  @Column({ default: false })
  teacherEdited!: boolean;

  @ManyToOne(() => Homework, (homework) => homework.assignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'homework_id' })
  homework!: Homework;

  @ManyToOne(() => Users, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Users;
}
