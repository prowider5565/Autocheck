import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHomeworkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description?: string;
}
