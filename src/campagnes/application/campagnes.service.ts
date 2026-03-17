import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampagneEntity, StatutCampagne } from '../domain/campagne.entity';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { ProjectsService } from '../../projects/application/projects.service';

@Injectable()
export class CampagnesService {
  constructor(
    @InjectRepository(CampagneEntity)
    private readonly campagneRepository: Repository<CampagneEntity>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(createCampagneDto: CreateCampagneDto, porteurId: string): Promise<CampagneEntity> {
    const projet = await this.projectsService.findOne(createCampagneDto.projetId);
    if (!projet) {
      throw new NotFoundException(`Projet ${createCampagneDto.projetId} introuvable`);
    }

    const projectOwnerId = String(projet.porteurId).trim();
    const requesterId = String(porteurId).trim();

    if (projectOwnerId !== requesterId) {
      throw new ForbiddenException(
        `Le projet ne vous appartient pas (projectOwnerId=${projectOwnerId}, requesterId=${requesterId})`,
      );
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

  async findOne(id: string): Promise<CampagneEntity> {
    const campagne = await this.campagneRepository.findOne({ where: { id } });
    if (!campagne) {
      throw new NotFoundException(`Campagne ${id} introuvable`);
    }
    return campagne;
  }

  async getStatistiques(id: string, porteurId: string): Promise<object> {
    const campagne = await this.findOne(id);

    if (campagne.porteurId !== porteurId) {
      throw new UnauthorizedException('Accès refusé : cette campagne ne vous appartient pas');
    }

    const objectif = Number(campagne.objectif);
    const montantCollecte = Number(campagne.montantCollecte);
    const tauxCompletion = objectif > 0
      ? Math.min(Math.round((montantCollecte / objectif) * 10000) / 100, 100)
      : 0;

    const maintenant = new Date();
    const joursRestants = Math.max(
      0,
      Math.ceil((campagne.dateFin.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const tempsRestant = joursRestants === 0 ? 'Terminée' : `${joursRestants} jours`;

    // nombreContributeurs et evolutionJournaliere viendront du service contributions
    const nombreContributeurs = 0;
    const contributionMoyenne = nombreContributeurs > 0
      ? Math.round((montantCollecte / nombreContributeurs) * 100) / 100
      : 0;

    return {
      campagneId: campagne.id,
      objectif,
      montantCollecte,
      tauxCompletion,
      nombreContributeurs,
      contributionMoyenne,
      tempsRestant,
      evolutionJournaliere: [],
      statut: campagne.statut,
    };
  }
}
