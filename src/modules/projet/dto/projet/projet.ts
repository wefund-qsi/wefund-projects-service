import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

export class ProjetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  titre: string;  

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  photo: string; 
}
