import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class ConfirmAssignmentReviewDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  finalScore!: number;

  @IsString()
  @MaxLength(1000)
  finalFeedback!: string;
}
