export class CourseResponseDto {
  id!: number;
  title!: string;
  description!: string | null;
  teacherId!: number;
  teacherName!: string;
  isArchived!: boolean;
  archivedAt!: Date | null;
  createdAt!: Date;
}
