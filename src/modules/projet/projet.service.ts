import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjetEntity } from './entities/projet.entity';
import { ProjetResponseDto } from './dto/response-projet/response-projet';
import { ProjetDto } from './dto/projet/projet';
import { UpdateProjetDto } from './dto/projet/UpdateProjetDto';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Injectable()
export class ProjetService {
  constructor(
    @InjectRepository(ProjetEntity)
    private projetRepository: Repository<ProjetEntity>,
  ) {}

  async create(projetDto: ProjetDto, porteurId: string): Promise<ProjetResponseDto> {
    if (porteurId !== MOCK_PORTEUR_ID) {
      throw new UnauthorizedException('Token invalide');
    }
    const projet = this.projetRepository.create({
      titre: projetDto.titre,
      description: projetDto.description,
      photo: projetDto.photo,
      porteurId,
    });
    const savedProjet = await this.projetRepository.save(projet);
    return this.entityToDto(savedProjet);
  }

  async update(id: string, updateProjetDto: UpdateProjetDto, porteurId: string): Promise<ProjetResponseDto> {
    if (porteurId !== MOCK_PORTEUR_ID) {
      throw new UnauthorizedException('Token invalide');
    }

    const projet = await this.projetRepository.findOne({ where: { id, porteurId } });
    if (!projet) {
      throw new NotFoundException(`Projet ${id} non trouvé ou non autorisé`);
    }

    Object.assign(projet, updateProjetDto);
    const updatedProjet = await this.projetRepository.save(projet);
    return this.entityToDto(updatedProjet);
  }

  async remove(id: string, porteurId: string): Promise<void> {
    if (porteurId !== MOCK_PORTEUR_ID) {
      throw new UnauthorizedException('Token invalide');
    }

    const projet = await this.projetRepository.findOne({ where: { id, porteurId } });
    if (!projet) {
      throw new NotFoundException(`Projet ${id} non trouvé ou non autorisé`);
    }

    await this.projetRepository.remove(projet);
  }

  async findAll(): Promise<ProjetResponseDto[]> {
    const projets = await this.projetRepository.find();
    return projets.map(p => this.entityToDto(p));
  }

  async findOne(id: string): Promise<ProjetResponseDto> {
    const projet = await this.projetRepository.findOne({ where: { id } });
    if (!projet) throw new NotFoundException(`Projet ${id} non trouvé`);
    return this.entityToDto(projet);
  }

  private entityToDto(projet: ProjetEntity): ProjetResponseDto {
    return {
      id: projet.id,
      titre: projet.titre,
      description: projet.description,
      photo: projet.photo,
      porteurId: projet.porteurId,           
      createdAt: projet.createdAt.toISOString(),
      updatedAt: projet.updatedAt.toISOString(),
    };
  }
}
