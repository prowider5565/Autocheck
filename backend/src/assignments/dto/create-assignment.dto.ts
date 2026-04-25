import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { AssignmentSourceType } from '../assignments.entity';

export class CreateAssignmentDto {
  @IsEnum(AssignmentSourceType)
  sourceType!: AssignmentSourceType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  extractedText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  originalText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
