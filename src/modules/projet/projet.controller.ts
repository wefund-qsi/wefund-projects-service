import { Controller, Get, Param, ParseUUIDPipe, Headers, UnauthorizedException, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { CreateProjetDto } from './dto/create-projet/create-projet';
import { ProjetResponseDto } from './dto/response-projet/response-projet';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Controller('projets')
export class ProjetController {
  constructor(private readonly projetService: ProjetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProjetDto: CreateProjetDto,        
    @Headers('authorization') authHeader: string,
  ): Promise<ProjetResponseDto> {
    const porteurId = this.extractPorteurId(authHeader);
    return this.projetService.create(createProjetDto, porteurId);
  }

  @Get()
  async findAll(@Headers('authorization') authHeader: string): Promise<ProjetResponseDto[]> {
    const porteurId = this.extractPorteurId(authHeader);
    return this.projetService.findAll(porteurId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ProjetResponseDto> {
    const porteurId = this.extractPorteurId(authHeader);
    return this.projetService.findOne(id, porteurId);
  }

  private extractPorteurId(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token requis');
    }
    return MOCK_PORTEUR_ID;
  }
}
