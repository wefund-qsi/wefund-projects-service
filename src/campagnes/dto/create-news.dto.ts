import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titre: string;

  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsString()
  @IsNotEmpty()
  campagneId: string;
}