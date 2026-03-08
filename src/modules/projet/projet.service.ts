import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjetEntity } from './entities/projet.entity';
import { CreateProjetDto } from './dto/create-projet/create-projet';
import { ProjetResponseDto } from './dto/response-projet/response-projet';

const MOCK_PORTEUR_ID = "cm9x8y7z6w5v4u3t2s1r0q";

@Injectable()
export class ProjetService {
  constructor(
    @InjectRepository(ProjetEntity)
    private projetRepository: Repository<ProjetEntity>,
  ) {}

  async create(createProjetDto: CreateProjetDto, porteurId: string): Promise<ProjetResponseDto> {
    if (porteurId !== MOCK_PORTEUR_ID) {
      throw new UnauthorizedException('Token invalide');
    }

    const projet = this.projetRepository.create({
      titre: createProjetDto.titre,
      description: createProjetDto.description,
      photo: createProjetDto.photo,
      porteurId,
    });

    const savedProjet = await this.projetRepository.save(projet);
    
    return {
      id: savedProjet.id,
      titre: savedProjet.titre,
      description: savedProjet.description,
      photo: savedProjet.photo,
      createdAt: savedProjet.createdAt,
    };
  }

  async findAll(): Promise<ProjetResponseDto[]> {
    const projets = await this.projetRepository.find();  
    return projets.map(p => ({
      id: p.id,
      titre: p.titre,
      description: p.description,
      photo: p.photo,
      createdAt: p.createdAt,
    }));
  }

  async findOne(id: string): Promise<ProjetResponseDto> {
    const projet = await this.projetRepository.findOne({ where: { id } });
    if (!projet) throw new NotFoundException(`Projet ${id} non trouvé`);
    return {
      id: projet.id,
      titre: projet.titre,
      description: projet.description,
      photo: projet.photo,
      createdAt: projet.createdAt,
    };
  }
}
