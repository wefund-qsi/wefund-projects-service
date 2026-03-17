import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { CampagnesService } from '../application/campagnes.service';
import { CreateCampagneDto } from '../dto/create-campagne.dto';
import { AuthGuard } from '../../auth/auth.guard';

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
}
