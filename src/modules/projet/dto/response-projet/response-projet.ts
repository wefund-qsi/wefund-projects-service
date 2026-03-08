import { IsUUID, IsString, IsDateString } from 'class-validator';

export class ProjetResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  titre: string; 

  @IsString()
  description: string;

  @IsString()
  photo: string;

  @IsDateString()
  createdAt: Date;
}
