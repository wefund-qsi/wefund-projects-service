import { Test, TestingModule } from '@nestjs/testing';
import { CampagnesService } from './campagnes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampagneEntity, StatutCampagne } from '../domain/campagne.entity';
import { NewsEntity } from '../domain/news.entity';
import { Repository } from 'typeorm';
import { ProjectsService } from '../../projects/application/projects.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CampagnesService', () => {
  let service: CampagnesService;
  let campagneRepository: Repository<CampagneEntity>;
  let newsRepository: Repository<NewsEntity>;
  let projectsService: ProjectsService;

  const mockCampagneRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockNewsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockProjectsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampagnesService,
        {
          provide: getRepositoryToken(CampagneEntity),
          useValue: mockCampagneRepository,
        },
        {
          provide: getRepositoryToken(NewsEntity),
          useValue: mockNewsRepository,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    service = module.get<CampagnesService>(CampagnesService);
    campagneRepository = module.get(getRepositoryToken(CampagneEntity));
    newsRepository = module.get(getRepositoryToken(NewsEntity));
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // CREATE
  it('should create a campagne', async () => {
    const dto = {
      projetId: '1',
      titre: 'Test',
      description: 'Desc',
      objectif: 1000,
      dateFin: new Date().toISOString(),
    };

    const projet = { id: '1', porteurId: 'user1' };

    mockProjectsService.findOne.mockResolvedValue(projet);
    mockCampagneRepository.create.mockReturnValue(dto);
    mockCampagneRepository.save.mockResolvedValue(dto);

    const result = await service.create(dto as any, 'user1');

    expect(result).toEqual(dto);
    expect(mockCampagneRepository.save).toHaveBeenCalled();
  });

  it('should throw if project not found', async () => {
    mockProjectsService.findOne.mockResolvedValue(null);

    await expect(
      service.create({ projetId: '1' } as any, 'user1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if not owner', async () => {
    mockProjectsService.findOne.mockResolvedValue({
      id: '1',
      porteurId: 'user2',
    });

    await expect(
      service.create({ projetId: '1' } as any, 'user1'),
    ).rejects.toThrow(ForbiddenException);
  });

  // UPDATE
  it('should update campagne', async () => {
    const campagne = {
      id: '1',
      porteurId: 'user1',
      statut: StatutCampagne.BROUILLON,
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(campagne as any);
    mockCampagneRepository.save.mockResolvedValue({
      ...campagne,
      titre: 'Updated',
    });

    const result = await service.update(
      '1',
      { titre: 'Updated' },
      'user1',
    );

    expect(result.titre).toBe('Updated');
  });

  it('should throw if not owner on update', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      porteurId: 'other',
      statut: StatutCampagne.BROUILLON,
    } as any);

    await expect(
      service.update('1', {}, 'user1'),
    ).rejects.toThrow(ForbiddenException);
  });

  // FIND ONE
  it('should return campagne', async () => {
    const campagne = { id: '1' };

    mockCampagneRepository.findOne.mockResolvedValue(campagne);

    const result = await service.findOne('1');

    expect(result).toEqual(campagne);
  });

  it('should throw if campagne not found', async () => {
    mockCampagneRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });

  // STATISTIQUE
  it('should return stats', async () => {
    const campagne = {
      id: '1',
      porteurId: 'user1',
      objectif: 100,
      montantCollecte: 50,
      dateFin: new Date(Date.now() + 86400000),
      statut: StatutCampagne.ACTIVE,
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(campagne as any);

    const result = await service.getStatistiques('1', 'user1');

    expect(result).toHaveProperty('tauxCompletion');
    expect(result).toHaveProperty('tempsRestant');
  });

  // NEW
  it('should create news', async () => {
    const campagne = {
      id: '1',
      porteurId: 'user1',
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(campagne as any);

    const dto = {
      campagneId: '1',
      titre: 'News',
      contenu: 'Content',
    };

    mockNewsRepository.create.mockReturnValue(dto);
    mockNewsRepository.save.mockResolvedValue(dto);

    const result = await service.createNews(dto as any, 'user1');

    expect(result).toEqual(dto);
  });

  // DUPLICATE
  it('should duplicate campagne', async () => {
    const campagne = {
      id: '1',
      porteurId: 'user1',
      statut: StatutCampagne.REUSSIE,
      titre: 'Test',
      description: 'Desc',
      objectif: 100,
      projetId: 'p1',
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(campagne as any);

    mockCampagneRepository.create.mockReturnValue(campagne);
    mockCampagneRepository.save.mockResolvedValue(campagne);

    const result = await service.duplicate('1', 'user1');

    expect(result).toBeDefined();
  });

});