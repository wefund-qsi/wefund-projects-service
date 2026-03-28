import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../infrastructure/project.entity';
import type { Project } from '../domain/project';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

  async create(createProjectDto: CreateProjectDto, porteurId: string): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      porteurId,
    });

    const savedProject = await this.projectRepository.save(project);
    return this.toDomainProject(savedProject);
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectRepository.find({
      order: { createdAt: 'DESC' },
    });

    return projects.map((project) => this.toDomainProject(project));
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Projet ${id} non trouvé`);
    }

    return this.toDomainProject(project);
  }

  private toDomainProject(entity: ProjectEntity): Project {
    return {
      id: entity.id,
      titre: entity.titre,
      description: entity.description,
      photo: entity.photo,
      porteurId: entity.porteurId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
