import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHomeworkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;
}
