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
  async closeExpiredCampaigns(): Promise<void> {
    this.logger.log('Checking for expired campaigns...');

    const currentDate = new Date();

    const campaignsToClose = await this.campagneRepository.find({
      where: {
        statut: StatutCampagne.ACTIVE,
        dateFin: LessThanOrEqual(currentDate), 
      },
    });

    if (campaignsToClose.length === 0) {
      this.logger.log('No campaigns to close at the moment.');
      return;
    }

    this.logger.log(`${campaignsToClose.length} campaign(s) to close found.`);

    for (const campaign of campaignsToClose) {
      try {
        const isGoalReached = Number(campaign.montantCollecte) >= Number(campaign.objectif);

        if (isGoalReached) {
          campaign.statut = StatutCampagne.REUSSIE;
        } else {
          campaign.statut = StatutCampagne.ECHOUEE;
        }

        await this.campagneRepository.save(campaign);
        
        this.logger.log(`Campaign [${campaign.id}] closed successfully. New status: ${campaign.statut}`);

      } catch (error) {
        
        this.logger.error(`Error while closing campaign [${campaign.id}]`, error.stack);
      }
    }
  }

}
