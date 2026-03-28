
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository, FindOptionsWhere } from 'typeorm';
import { CampagneEntity } from '../infrastructure/campagne.entity';
import { StatutCampagne } from '../domain/statut-campagne';
import type { Campagne } from '../domain/campagne';
import type { News } from '../domain/news';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { ProjectsService } from '../../projects/application/projects.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsEntity } from '../infrastructure/news.entity';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateCampagneDto } from '../dto/update-campagne.dto';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';


@Injectable()
export class CampagnesService implements OnModuleInit {

  private readonly logger = new Logger(CampagnesService.name);

  constructor(
    @InjectRepository(CampagneEntity)
    private readonly campagneRepository: Repository<CampagneEntity>,
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    private readonly projectsService: ProjectsService,
    @Inject('KafkaProducer')
    private readonly kafkaClient: ClientKafka,
  ) { }

  async create(createCampagneDto: CreateCampagneDto, porteurId: string): Promise<Campagne> {
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

    const savedCampagne = await this.campagneRepository.save(campagne);
    return this.toDomainCampagne(savedCampagne);
  }

  async update(
    id: string,
    updateCampagneDto: UpdateCampagneDto,
    porteurId: string,
  ): Promise<Campagne> {
    const campagne = await this.requireCampagneEntity(id);

    if (campagne.porteurId !== porteurId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cette campagne",
      );
    }

    if (campagne.statut !== StatutCampagne.BROUILLON) {
      throw new ForbiddenException(
        'Seules les campagnes en brouillon peuvent être modifiées',
      );
    }

    if (updateCampagneDto.titre !== undefined) {
      campagne.titre = updateCampagneDto.titre;
    }

    if (updateCampagneDto.description !== undefined) {
      campagne.description = updateCampagneDto.description;
    }

    if (updateCampagneDto.objectif !== undefined) {
      campagne.objectif = updateCampagneDto.objectif;
    }

    if (updateCampagneDto.dateFin !== undefined) {
      campagne.dateFin = new Date(updateCampagneDto.dateFin);
    }

    const savedCampagne = await this.campagneRepository.save(campagne);
    return this.toDomainCampagne(savedCampagne);
  }

  async submit(id: string, porteurId: string): Promise<Campagne> {
    const campagne = await this.requireCampagneEntity(id);

    if (campagne.porteurId !== porteurId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à soumettre cette campagne",
      );
    }

    if (campagne.statut !== StatutCampagne.BROUILLON) {
      throw new ForbiddenException(
        'Seules les campagnes en brouillon peuvent être soumises',
      );
    }

    campagne.statut = StatutCampagne.EN_ATTENTE;
    const savedCampagne = await this.campagneRepository.save(campagne);

    this.emitCampaignEvent('campaign.submitted', savedCampagne);

    return this.toDomainCampagne(savedCampagne);
  }

  async moderate(id: string, nouveauStatut: StatutCampagne): Promise<Campagne> {
    const campagne = await this.requireCampagneEntity(id);

    if (campagne.statut !== StatutCampagne.EN_ATTENTE) {
      throw new BadRequestException(
        `Impossible de modérer cette campagne. Son statut actuel est : ${campagne.statut}. Elle doit être EN_ATTENTE.`,
      );
    }

    campagne.statut = nouveauStatut;
    const savedCampagne = await this.campagneRepository.save(campagne);

    this.emitCampaignEvent('campaign.moderated', savedCampagne);

    return this.toDomainCampagne(savedCampagne);
  }



  async findAll(
    projetId?: string,
    statut?: StatutCampagne,
  ): Promise<Campagne[]> {
    const where: FindOptionsWhere<CampagneEntity> = {};

    if (projetId) {
      where.projetId = projetId;
    }

    if (statut) {
      where.statut = statut;
    }

    const campagnes = await this.campagneRepository.find({
      where,
      relations: ['projet'],
      order: { createdAt: 'DESC' },
    });

    return campagnes.map((campagne) => this.toDomainCampagne(campagne));
  }

  async findOneDetailed(id: string): Promise<Campagne> {
    const campagne = await this.campagneRepository.findOne({
      where: { id },
      relations: ['projet'],
    });

    if (!campagne) {
      throw new NotFoundException(`Campagne ${id} introuvable`);
    }

    return this.toDomainCampagne(campagne);
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

        if (campaign.statut === StatutCampagne.REUSSIE) {
          this.emitCampaignEvent('campaign.closed.success', campaign);
        } else {
          this.emitCampaignEvent('campaign.closed.failed', campaign);
        }
      } catch (error) {

        this.logger.error(`Error while closing campaign [${campaign.id}]`, error.stack);
      }
    }
  }

  async findOne(id: string): Promise<Campagne> {
    const campagne = await this.requireCampagneEntity(id);
    return this.toDomainCampagne(campagne);
  }

  async getStatistiques(id: string, porteurId: string,): Promise<object> {
    const campagne = await this.requireCampagneEntity(id);

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

  async createNews(createNewsDto: CreateNewsDto, porteurId: string, campagneId: string): Promise<News> {
  const campagne = await this.requireCampagneEntity(campagneId);

  if (campagne.porteurId !== porteurId) {
    throw new ForbiddenException('Vous n\'êtes pas autorisé à publier des actualités sur cette campagne');
  }

  const news = this.newsRepository.create({
    titre: createNewsDto.titre,
    contenu: createNewsDto.contenu,
    campagneId,
  });

  const savedNews = await this.newsRepository.save(news);
  return this.toDomainNews(savedNews);
}

  async getNewsForCampagne(campagneId: string): Promise<News[]> {
    await this.requireCampagneEntity(campagneId);

    const news = await this.newsRepository.find({
      where: { campagneId },
      order: { createdAt: 'DESC' },
    });

    return news.map((item) => this.toDomainNews(item));
  }

  async duplicate(id: string, porteurId: string): Promise<Campagne> {
    const campagne = await this.requireCampagneEntity(id);

    if (campagne.porteurId !== porteurId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à dupliquer cette campagne",
      );
    }

    if (
      campagne.statut !== StatutCampagne.REUSSIE &&
      campagne.statut !== StatutCampagne.ECHOUEE
    ) {
      throw new ForbiddenException(
        'Seules les campagnes terminées peuvent être dupliquées',
      );
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);

    const duplicatedCampagne = this.campagneRepository.create({
      titre: campagne.titre,
      description: campagne.description,
      objectif: campagne.objectif,
      montantCollecte: 0,
      dateFin: futureDate,
      statut: StatutCampagne.BROUILLON,
      porteurId: campagne.porteurId,
      projetId: campagne.projetId,
    });

    const savedCampagne = await this.campagneRepository.save(duplicatedCampagne);
    return this.toDomainCampagne(savedCampagne);
  }

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  private async requireCampagneEntity(id: string): Promise<CampagneEntity> {
    const campagne = await this.campagneRepository.findOne({ where: { id } });

    if (!campagne) {
      throw new NotFoundException(`Campagne ${id} introuvable`);
    }

    return campagne;
  }

  private toDomainCampagne(entity: CampagneEntity): Campagne {
    return {
      id: entity.id,
      titre: entity.titre,
      description: entity.description,
      objectif: Number(entity.objectif),
      montantCollecte: Number(entity.montantCollecte),
      dateFin: entity.dateFin,
      statut: entity.statut,
      porteurId: entity.porteurId,
      projetId: entity.projetId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toDomainNews(entity: NewsEntity): News {
    return {
      id: entity.id,
      titre: entity.titre,
      contenu: entity.contenu,
      campagneId: entity.campagneId,
      createdAt: entity.createdAt,
    };
  }

  private emitCampaignEvent(topic: string, campagne: CampagneEntity): void {
    const payload = {
      campagneId: campagne.id,
      projetId: campagne.projetId,
      porteurId: campagne.porteurId,
      statut: campagne.statut,
      objectif: Number(campagne.objectif),
      montantCollecte: Number(campagne.montantCollecte),
      dateFin: campagne.dateFin.toISOString(),
      occurredAt: new Date().toISOString(),
    };

    this.kafkaClient.emit(topic, payload).subscribe({
      next: () => this.logger.log(`📢 Événement Kafka envoyé : ${topic} (Campagne ${campagne.id})`),
      error: (err) => this.logger.error(`❌ Erreur d'envoi Kafka pour ${topic}`, err),
    });
  }

}



