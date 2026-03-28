import { Controller, Post, Get, Patch, Param, Body, HttpCode, HttpStatus, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { CampagnesService } from '../application/campagnes.service';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateNewsDto } from '../dto/create-news.dto';
import { StatutCampagne } from '../domain/statut-campagne';
import { UpdateCampagneDto } from '../dto/update-campagne.dto';
import type { Campagne } from '../domain/campagne';
import type { News } from '../domain/news';
import { ModerateCampagneDto } from '../dto/moderate-campagne.dto';


@Controller('campagnes')
export class CampagnesController {
  constructor(private readonly campagnesService: CampagnesService) { }

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCampagneDto: CreateCampagneDto,
    @Request() req: any,
  ): Promise<Campagne> {
    const porteurId = req.user.sub;
    return await this.campagnesService.create(createCampagneDto, porteurId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('projetId') projetId?: string,
    @Query('statut') statut?: StatutCampagne,
  ): Promise<Campagne[]> {
    return await this.campagnesService.findAll(projetId, statut);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Campagne> {
    return await this.campagnesService.findOneDetailed(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCampagneDto: UpdateCampagneDto,
    @Request() req: any,
  ): Promise<Campagne> {
    const porteurId = req.user.sub;
    return await this.campagnesService.update(id, updateCampagneDto, porteurId);
  }

  @Post(':id/soumettre')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Campagne> {
    const porteurId = req.user.sub;
    return await this.campagnesService.submit(id, porteurId);
  }


  @Get(':id/stats')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getStatistiques(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<object> {
    const porteurId = req.user.sub;
    return await this.campagnesService.getStatistiques(id, porteurId);
  }

  @Post(':id/actualites')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createNews(
    @Param('id') campagneId: string,
    @Body() createNewsDto: CreateNewsDto,
    @Request() req: any,
  ): Promise<News> {
    const porteurId = req.user.sub;
    createNewsDto.campagneId = campagneId;
    return await this.campagnesService.createNews(createNewsDto, porteurId);
  }

  @Get(':id/actualites')
  @HttpCode(HttpStatus.OK)
  async getNewsForCampagne(
    @Param('id') campagneId: string,
  ): Promise<News[]> {
    return await this.campagnesService.getNewsForCampagne(campagneId);
  }

  @Post(':id/dupliquer')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async duplicate(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Campagne> {
    const porteurId = req.user.sub;
    return await this.campagnesService.duplicate(id, porteurId);
  }

  @Patch(':id/moderation')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async moderateCampagne(
    @Param('id') id: string,
    @Body() moderateDto: ModerateCampagneDto,
    @Request() req: any,
  ): Promise<Campagne> {
    const userRole = req.user.role;

    if (userRole !== 'ADMINISTRATEUR' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Accès refusé : Seul un administrateur peut modérer une campagne.');
    }

    // 3. On appelle le service pour mettre à jour en base de données
    return await this.campagnesService.moderate(id, moderateDto.statut);
  }
}

