import { IsString, IsNotEmpty, IsUrl, MinLength, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  titre: string; 

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string; 

  @IsUrl()
  @IsNotEmpty()
  photo: string; 

  
}