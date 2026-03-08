import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../domain/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, porteurId: string): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      porteurId, 
    });
    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
  return await this.projectRepository.find({
    order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Project> {
  const project = await this.projectRepository.findOne({
    where: { id }
  });
  
  if (!project) {
    throw new NotFoundException(`Projet ${id} non trouvé`);
  }
  return project;
}
}