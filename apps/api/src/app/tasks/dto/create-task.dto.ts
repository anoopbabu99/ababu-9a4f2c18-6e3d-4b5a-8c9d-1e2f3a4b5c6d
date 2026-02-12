import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional() // It is optional because we have a default "General"
  @IsString()
  category?: string;
}