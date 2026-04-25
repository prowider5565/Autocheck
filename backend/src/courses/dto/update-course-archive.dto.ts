import { IsBoolean } from 'class-validator';

export class UpdateCourseArchiveDto {
  @IsBoolean()
  isArchived!: boolean;
}
