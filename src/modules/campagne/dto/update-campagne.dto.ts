import { 
  IsString, IsOptional, MinLength, MaxLength, 
  IsNumber, Min, IsDateString 
} from 'class-validator';

export class UpdateCampagneDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  titre?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  objectif?: number;

  @IsDateString()
  @IsOptional()
  dateFin?: string;
}
