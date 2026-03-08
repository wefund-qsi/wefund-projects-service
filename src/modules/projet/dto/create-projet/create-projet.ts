import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateProjetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titre: string;  // ← Remplace "nom"

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  photo: string;  // URL photo
}
