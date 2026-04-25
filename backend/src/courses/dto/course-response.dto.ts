export class CourseResponseDto {
  id!: number;
  title!: string;
  description!: string | null;
  teacherId!: number;
  teacherName!: string;
  createdAt!: Date;
}
