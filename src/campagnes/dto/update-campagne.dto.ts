import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';

export class UpdateCampagneDto {
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
  @IsNumber()
  @Min(0.01)
  objectif?: number;

  @IsOptional()
  @IsDateString()
  dateFin?: string;
}
