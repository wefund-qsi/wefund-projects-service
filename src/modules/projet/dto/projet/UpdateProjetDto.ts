import { IsOptional, IsString, MinLength, IsUrl, MaxLength } from 'class-validator';

export class UpdateProjetDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  titre?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  photo?: string;
}
