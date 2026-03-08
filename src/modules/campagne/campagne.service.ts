import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampagneEntity, StatutCampagne } from './entities/campagne.entity';
import { CreateCampagneDto } from './dto/create-campagne.dto';
import { CampagneResponseDto } from './dto/campagne-response.dto';
import { ProjetService } from '../projet/projet.service';
import { UpdateCampagneDto } from './dto/update-campagne.dto';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Injectable()
export class CampagneService {
  constructor(
    @InjectRepository(CampagneEntity)
    private campagneRepository: Repository<CampagneEntity>,
    private projetService: ProjetService,
  ) {}

  async create(createCampagneDto: CreateCampagneDto, porteurId: string): Promise<CampagneResponseDto> {
    if (porteurId !== MOCK_PORTEUR_ID) {
      throw new UnauthorizedException('Token invalide');
    }

    const dateFin = new Date(createCampagneDto.dateFin);
    if (dateFin <= new Date()) {
        throw new BadRequestException('dateFin doit être dans le futur');
    }
    const projet = await this.projetService.findOne(createCampagneDto.projetId);
    if (projet.porteurId !== porteurId) {
      throw new BadRequestException('Projet non autorisé');
    }

    const campagne = this.campagneRepository.create({
      ...createCampagneDto,
      dateFin: new Date(createCampagneDto.dateFin),
      porteurId,
      statut: StatutCampagne.BROUILLON,
      montantCollecte: 0,
    });

    const savedCampagne = await this.campagneRepository.save(campagne);
    return this.entityToDto(savedCampagne);
  }

  async findAll(): Promise<CampagneResponseDto[]> {
    const campagnes = await this.campagneRepository.find({
        relations: ['projet'], // Inclut les infos projet
        order: { createdAt: 'DESC' }
    });
    return campagnes.map(c => this.entityToDto(c));
    }

    async findOne(id: string): Promise<CampagneResponseDto> {
    const campagne = await this.campagneRepository.findOne({
        where: { id },
        relations: ['projet']
    });
    
    if (!campagne) {
        throw new NotFoundException(`Campagne ${id} non trouvée`);
    }
    
    return this.entityToDto(campagne);
  }

  async update(
    id: string, 
    updateCampagneDto: UpdateCampagneDto, 
    porteurId: string
    ): Promise<CampagneResponseDto> {
    const campagne = await this.campagneRepository.findOne({
        where: { id },
        relations: ['projet']
    });
    
    if (!campagne) {
        throw new NotFoundException(`Campagne ${id} non trouvée`);
    }

    if (campagne.statut !== StatutCampagne.BROUILLON) {
        throw new ForbiddenException('Seules les campagnes BROUILLON peuvent être modifiées');
    }

    if (campagne.projet.porteurId !== porteurId) {
        throw new ForbiddenException('Non propriétaire de cette campagne');
    }

    if (updateCampagneDto.titre) campagne.titre = updateCampagneDto.titre;
    if (updateCampagneDto.description) campagne.description = updateCampagneDto.description;
    if (updateCampagneDto.objectif) campagne.objectif = updateCampagneDto.objectif;
    if (updateCampagneDto.dateFin) campagne.dateFin = new Date(updateCampagneDto.dateFin);

    const updatedCampagne = await this.campagneRepository.save(campagne);
    return this.entityToDto(updatedCampagne);
}


  private entityToDto(campagne: CampagneEntity): CampagneResponseDto {
    return {
      id: campagne.id,
      titre: campagne.titre,
      description: campagne.description,
      objectif: parseFloat(campagne.objectif.toString()),
      montantCollecte: parseFloat(campagne.montantCollecte.toString()),
      dateFin: campagne.dateFin.toISOString(),
      statut: campagne.statut,
      porteurId: campagne.porteurId,
      projetId: campagne.projetId,
      createdAt: campagne.createdAt.toISOString(),
      updatedAt: campagne.updatedAt.toISOString(),
    };
  }
}
