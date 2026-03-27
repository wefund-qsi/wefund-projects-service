// projects.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../domain/project.entity';
import { ProjectsService } from './projects.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ObjectLiteral } from 'typeorm';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: MockRepository<Project>;


  const mockProject: Project = {
    id: '1',
    name: 'Projet test',
    titre: 'Titre du projet',
    description: 'Description du projet',
    photo: 'url/photo.jpg',
    porteurId: 'porteur1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Project;


  const mockCreateProjectDto: CreateProjectDto = {
    name: 'Nouveau projet',
    titre: 'Titre du projet',
    description: 'Description test',
    photo: 'url/photo.jpg',
  } as CreateProjectDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<MockRepository<Project>>(getRepositoryToken(Project));
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('doit créer et sauvegarder un projet avec porteurId', async () => {
      (projectRepository.create as jest.Mock).mockReturnValue(mockProject);
      (projectRepository.save as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.create(mockCreateProjectDto, 'porteur1');

      expect(projectRepository.create).toHaveBeenCalledWith({
        ...mockCreateProjectDto,
        porteurId: 'porteur1',
      });
      expect(projectRepository.save).toHaveBeenCalledWith(mockProject);
      expect(result).toEqual(mockProject);
    });
  });

  describe('findAll', () => {
    it('doit appeler repository.find avec tri DESC sur createdAt', async () => {
      const projects = [mockProject];
      (projectRepository.find as jest.Mock).mockResolvedValue(projects);

      const result = await service.findAll();

      expect(projectRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(projects);
    });
  });

  describe('findOne', () => {
    it('doit retourner le projet trouvé', async () => {
      (projectRepository.findOne as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.findOne('1');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockProject);
    });

    it('doit lever NotFoundException si aucun projet n’est trouvé', async () => {
      (projectRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException(`Projet 999 non trouvé`),
      );
    });
  });

  describe('remove', () => {
    it('doit supprimer le projet avec l’id donné', async () => {
      (projectRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(projectRepository.delete).toHaveBeenCalledWith({ id: '1' });
    });

    it('doit lever NotFoundException si aucun projet n’est affecté', async () => {
      (projectRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove('999')).rejects.toThrow(
        new NotFoundException(`Projet 999 non trouvé`),
      );
    });
  });
});