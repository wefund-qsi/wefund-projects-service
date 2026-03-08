import { IsUUID, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { StatutCampagne } from '../entities/campagne.entity';

export class CampagneResponseDto {
  @IsUUID('4')
  id: string;

  @IsString()
  titre: string;

  @IsString()
  description: string;

  @IsNumber()
  objectif: number;

  @IsNumber()
  montantCollecte: number;

  @IsDateString()
  dateFin: string;

  @IsEnum(StatutCampagne)
  statut: StatutCampagne;

  @IsString()
  porteurId: string;

  @IsString()
  projetId: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}
