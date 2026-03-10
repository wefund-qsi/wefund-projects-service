import { Controller, Post, Body, HttpCode, HttpStatus, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CampagnesService } from '../application/campagnes.service';
import { CreateCampagneDto } from '../dto/create-campagne.dto';

const MOCK_PORTEUR_ID = 'cm9x8y7z6w5v4u3t2s1r0q';

@Controller('campagnes')
export class CampagnesController {
  private readonly MOCK_PORTEUR_ID = 'cm9x8y7z6w5v4u3t2s1r0q';

  constructor(private readonly campagnesService: CampagnesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCampagneDto: CreateCampagneDto,
    @Headers('authorization') authHeader: string,
  ): Promise<any> {
    const porteurId = this.extractPorteurId(authHeader);
    return await this.campagnesService.create(createCampagneDto, porteurId);
  }

  private extractPorteurId(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token requis');
    }

    return MOCK_PORTEUR_ID;
  }
}
