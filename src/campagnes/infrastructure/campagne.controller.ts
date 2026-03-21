import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { CampagnesService } from '../application/campagnes.service';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateNewsDto } from '../dto/create-news.dto';
import { StatutCampagne } from '../domain/campagne.entity';


@Controller('campagnes')
export class CampagnesController {
  constructor(private readonly campagnesService: CampagnesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCampagneDto: CreateCampagneDto,
    @Request() req: any,
  ): Promise<any> {
    const porteurId = req.user.sub;
    return await this.campagnesService.create(createCampagneDto, porteurId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('projetId') projetId?: string,
    @Query('statut') statut?: StatutCampagne,
  ): Promise<any> {
    return await this.campagnesService.findAll(projetId, statut);
  }


  @Get(':id/stats')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getStatistiques(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    const porteurId = req.user.sub;
    return await this.campagnesService.getStatistiques(id, porteurId);
  }

  @Post(':id/news')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createNews(
    @Param('id') campagneId: string,
    @Body() createNewsDto: CreateNewsDto,
    @Request() req: any,
  ): Promise<any> {
    const porteurId = req.user.sub;
    createNewsDto.campagneId = campagneId;
    return await this.campagnesService.createNews(createNewsDto, porteurId);
  }

  @Get(':id/news')
  @HttpCode(HttpStatus.OK)
  async getNewsForCampagne(
    @Param('id') campagneId: string,
  ): Promise<any> {
    return await this.campagnesService.getNewsForCampagne(campagneId);
  }
}
