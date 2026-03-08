import { Controller, Post, Body, HttpCode, HttpStatus, Headers, UnauthorizedException, ParseUUIDPipe, Param, Get } from '@nestjs/common';
import { CampagneService } from './campagne.service';
import { CreateCampagneDto } from './dto/create-campagne.dto';
import { CampagneResponseDto } from './dto/campagne-response.dto';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Controller('campagnes')
export class CampagneController {
  constructor(private readonly campagneService: CampagneService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCampagneDto: CreateCampagneDto,
    @Headers('authorization') authHeader: string,
  ): Promise<CampagneResponseDto> {
    const porteurId = this.extractPorteurId(authHeader);
    return this.campagneService.create(createCampagneDto, porteurId);
  }
  @Get()
  findAll() {
    return this.campagneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campagneService.findOne(id);
  }

  private extractPorteurId(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token requis');
    }
    return MOCK_PORTEUR_ID;
  }
}
