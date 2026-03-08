import { Controller, Get, Post, Patch, Delete, Param, ParseUUIDPipe, Body, HttpCode, HttpStatus, Headers, UnauthorizedException } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetDto } from './dto/projet/projet';
import { ProjetResponseDto } from './dto/response-projet/response-projet';
import { UpdateProjetDto } from './dto/projet/UpdateProjetDto';


const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Controller('projets')
export class ProjetController {
  constructor(private readonly projetService: ProjetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() projetDto: ProjetDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ProjetResponseDto> {
    const porteurId = this.extractPorteurId(authHeader);
    return this.projetService.create(projetDto, porteurId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjetDto: UpdateProjetDto,  // ← UpdateProjetDto !
    @Headers('authorization') authHeader: string,
  ): Promise<ProjetResponseDto> {
    const porteurId = this.extractPorteurId(authHeader);
    return this.projetService.update(id, updateProjetDto, porteurId); 
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const porteurId = this.extractPorteurId(authHeader);
    await this.projetService.remove(id, porteurId);
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
