import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ProjetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titre: string;  

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  photo: string; 
}
