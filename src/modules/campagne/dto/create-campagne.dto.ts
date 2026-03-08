import { IsString, MinLength, MaxLength, IsNumber, Min, IsDateString, IsUUID, IsNotEmpty, MinDate} from 'class-validator';
export class CreateCampagneDto {
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

  @IsNumber()
  @Min(0.01)
  objectif: number;

  @IsDateString()
  dateFin: string;

  @IsUUID('4')
  @IsNotEmpty()
  projetId: string;
}
