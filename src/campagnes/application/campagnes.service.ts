import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampagneEntity, StatutCampagne } from '../domain/campagne.entity';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { ProjectsService } from '../../projects/application/projects.service';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Injectable()
export class CampagnesService {
  constructor(
    @InjectRepository(CampagneEntity)
    private readonly campagneRepository: Repository<CampagneEntity>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(createCampagneDto: CreateCampagneDto, porteurId: string): Promise<CampagneEntity> {
    if (porteurId !== MOCK_PORTEUR_ID) {
      throw new UnauthorizedException('Token invalide');
    }

    const projet = await this.projectsService.findOne(createCampagneDto.projetId);
    if (!projet) {
      throw new NotFoundException(`Projet ${createCampagneDto.projetId} introuvable`);
    }

    if (projet.porteurId !== porteurId) {
      throw new BadRequestException('Le projet ne vous appartient pas');
    }

    const campagne = this.campagneRepository.create({
      ...createCampagneDto,
      dateFin: new Date(createCampagneDto.dateFin),
      porteurId,
      statut: StatutCampagne.BROUILLON,
      montantCollecte: 0,
    });

    return await this.campagneRepository.save(campagne);
  }
}
