import { Injectable, NotFoundException, BadRequestException, UnauthorizedException ,Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CampagneEntity, StatutCampagne } from '../domain/campagne.entity';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { ProjectsService } from '../../projects/application/projects.service';
import { Cron, CronExpression } from '@nestjs/schedule';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Injectable()
export class CampagnesService {

  private readonly logger = new Logger(CampagnesService.name);

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

  @Cron(CronExpression.EVERY_10_SECONDS) 
  async cloturerCampagnesTerminees(): Promise<void> {
    this.logger.log('Vérification des campagnes arrivées à échéance...');

    const currentDate = new Date();

    const campagnesACloturer = await this.campagneRepository.find({
      where: {
        statut: StatutCampagne.ACTIVE,
        dateFin: LessThanOrEqual(currentDate), 
      },
    });

    if (campagnesACloturer.length === 0) {
      this.logger.log('Aucune campagne à clôturer pour le moment.');
      return;
    }

    this.logger.log(`${campagnesACloturer.length} campagne(s) à clôturer trouvée(s).`);

    for (const campagne of campagnesACloturer) {
      try {
        const objectifAtteint = Number(campagne.montantCollecte) >= Number(campagne.objectif);

        if (objectifAtteint) {
          campagne.statut = StatutCampagne.REUSSIE;
        } else {
          campagne.statut = StatutCampagne.ECHOUEE;
        }

        await this.campagneRepository.save(campagne);
        
        this.logger.log(`Campagne [${campagne.id}] clôturée avec succès. Nouveau statut : ${campagne.statut}`);

       

      } catch (error) {
        
        this.logger.error(`Erreur lors de la clôture de la campagne [${campagne.id}]`, error.stack);
      }
    }
  }

}
