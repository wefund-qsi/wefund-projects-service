import { Controller, Get, Param, ParseUUIDPipe, Post, Body, HttpCode, HttpStatus, Headers, UnauthorizedException } from '@nestjs/common';
import { ProjetService } from './projet.service';        // ← Chemin corrigé
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
  async findAll(): Promise<ProjetResponseDto[]> {
    return this.projetService.findAll(); 
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProjetResponseDto> {
    return this.projetService.findOne(id);  
  }

  private extractPorteurId(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token requis');
    }
    return MOCK_PORTEUR_ID;
  }
}
