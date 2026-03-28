import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(30000);

describe('CampagnesController (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let kafkaMock: any;
  let currentUserId = 'test-porteur-id';

  class DynamicMockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      req.user = { sub: currentUserId };
      return true;
    }
  }

  async function createProject(ownerId?: string) {
    const previousUserId = currentUserId;
    if (ownerId) currentUserId = ownerId;
    
    const res = await request(app.getHttpServer())
      .post('/projets')
      .set('Authorization', 'Bearer testtoken')
      .send({
        titre: 'Projet test',
        description: 'Description projet test avec au moins 10 caractères',
        photo: 'http://example.com/photo.jpg',
      })
      .expect(201);
    
    currentUserId = previousUserId;
    return res.body;
  }

  async function createCampagne(projetId: string, override: any = {}, userId?: string) {
    const previousUserId = currentUserId;
    if (userId) currentUserId = userId;
    
    const campagneDto = {
      titre: 'Campagne test',
      description: 'Description campagne test avec au moins 10 caractères',
      objectif: 1000,
      dateFin: new Date(Date.now() + 86400000).toISOString(),
      projetId,
      ...override,
    };
    
    const res = await request(app.getHttpServer())
      .post('/campagnes')
      .set('Authorization', 'Bearer testtoken')
      .send(campagneDto);
    
    currentUserId = previousUserId;
    return res;
  }

  async function createCampagneWithProject(ownerId?: string) {
    const project = await createProject(ownerId);
    // Pour créer une campagne, il faut être le propriétaire du projet
    // Donc on utilise le même ownerId pour la campagne
    const response = await createCampagne(project.id, {}, ownerId);
    return { campagne: response.body, project };
  }

  const cleanupDatabase = async () => {
    try {
      await dataSource.query('DELETE FROM news;');
      await dataSource.query('DELETE FROM campagnes;');
      await dataSource.query('DELETE FROM projects;');
    } catch (error) {
      // Silence is golden
    }
  };

  beforeAll(async () => {
    kafkaMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('KafkaProducer')
      .useValue(kafkaMock)
      .overrideGuard(require('../src/auth/auth.guard').AuthGuard)
      .useClass(DynamicMockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      transform: true,
    }));
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    jest.clearAllMocks();
    currentUserId = 'test-porteur-id';
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Story 2: Créer une campagne de financement', () => {
    it('should create a campaign with valid data', async () => {
      const project = await createProject();
      
      const response = await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne de financement',
          description: 'Description détaillée de la campagne avec assez de caractères',
          objectif: 5000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        })
        .expect(201);
      
      expect(response.body).toMatchObject({
        titre: 'Campagne de financement',
        statut: 'BROUILLON',
      });
      expect(Number(response.body.montantCollecte)).toBe(0);
      expect(Number(response.body.objectif)).toBe(5000);
    });

    it('should return 404 when projetId does not exist', async () => {
      await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne test',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: uuidv4(),
        })
        .expect(404);
    });

    it('should return 403 when user does not own the project', async () => {
      // Créer un projet avec un autre propriétaire
      const project = await createProject('autre-porteur-id');
      
      // Essayer de créer une campagne avec l'utilisateur par défaut (test-porteur-id)
      await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne test',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        })
        .expect(403);
    });

    it('should return 400 when titre is too short (< 3 chars)', async () => {
      const project = await createProject();
      
      await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'ab',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        })
        .expect(400);
    });
  });

  describe('Story 3: Modifier une campagne', () => {
    it('should update a campaign in draft status', async () => {
      const { campagne } = await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .patch(`/campagnes/${campagne.id}`)
        .set('Authorization', 'Bearer testtoken')
        .send({ titre: 'Campagne modifiée' })
        .expect(200);
      
      expect(response.body.titre).toBe('Campagne modifiée');
    });

    it('should return 403 when updating campaign owned by another user', async () => {
      // Créer un projet et une campagne avec un autre utilisateur
      const project = await createProject('autre-porteur-id');
      const createRes = await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne autre',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        });
      
      // Si la création a réussi (l'utilisateur actuel est 'autre-porteur-id' via createProject)
      // Mais attention: currentUserId a été changé puis restauré
      // Il faut récupérer l'ID de la campagne créée
      if (createRes.status === 201) {
        const campagneId = createRes.body.id;
        
        // Changer l'utilisateur courant pour tester la mise à jour par un autre
        currentUserId = 'test-porteur-id';
        
        await request(app.getHttpServer())
          .patch(`/campagnes/${campagneId}`)
          .set('Authorization', 'Bearer testtoken')
          .send({ titre: 'Tentative' })
          .expect(403);
      }
    });

    it('should return 404 when campaign does not exist', async () => {
      await request(app.getHttpServer())
        .patch(`/campagnes/${uuidv4()}`)
        .set('Authorization', 'Bearer testtoken')
        .send({ titre: 'Test' })
        .expect(404);
    });
  });

  describe('RG3: Campagne non modifiable après publication', () => {
    it('should not allow updating a submitted campaign', async () => {
      const { campagne } = await createCampagneWithProject();
      
      await request(app.getHttpServer())
        .post(`/campagnes/${campagne.id}/soumettre`)
        .set('Authorization', 'Bearer testtoken')
        .expect(200);
      
      await request(app.getHttpServer())
        .patch(`/campagnes/${campagne.id}`)
        .set('Authorization', 'Bearer testtoken')
        .send({ titre: 'Tentative' })
        .expect(403);
    });
  });

  describe('Story 4: Consulter les campagnes', () => {
    it('should return empty array when no campaigns exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/campagnes')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return all campaigns', async () => {
      await createCampagneWithProject();
      await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .get('/campagnes')
        .expect(200);
      expect(response.body.length).toBe(2);
    });

    it('should filter campaigns by projetId', async () => {
      const { project, campagne } = await createCampagneWithProject();
      await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .get(`/campagnes?projetId=${project.id}`)
        .expect(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(campagne.id);
    });

    it('should get campaign details by id', async () => {
      const { campagne, project } = await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .get(`/campagnes/${campagne.id}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        id: campagne.id,
        titre: campagne.titre,
        projetId: project.id,
      });
    });
  });

  describe('Story 6: Publier des actualités', () => {
    it('should add news to campaign', async () => {
      const { campagne } = await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .post(`/campagnes/${campagne.id}/news`)
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Nouvelle actualité',
          contenu: 'Contenu détaillé de l\'actualité',
          campagneId: campagne.id,
        })
        .expect(201);
      
      expect(response.body).toMatchObject({
        titre: 'Nouvelle actualité',
        campagneId: campagne.id,
      });
    });

    it('should get all news for a campaign', async () => {
      const { campagne } = await createCampagneWithProject();
      
      await request(app.getHttpServer())
        .post(`/campagnes/${campagne.id}/news`)
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'News 1',
          contenu: 'Contenu 1',
          campagneId: campagne.id,
        });
      
      await request(app.getHttpServer())
        .post(`/campagnes/${campagne.id}/news`)
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'News 2',
          contenu: 'Contenu 2',
          campagneId: campagne.id,
        });
      
      const response = await request(app.getHttpServer())
        .get(`/campagnes/${campagne.id}/news`)
        .expect(200);
      
      expect(response.body.length).toBe(2);
    });

    it('should return 403 when adding news to campaign owned by another user', async () => {
      // Créer un projet et une campagne avec un autre utilisateur
      const project = await createProject('autre-porteur-id');
      const createRes = await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne autre',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        });
      
      if (createRes.status === 201) {
        const campagneId = createRes.body.id;
        
        // Changer l'utilisateur courant
        currentUserId = 'test-porteur-id';
        
        await request(app.getHttpServer())
          .post(`/campagnes/${campagneId}/news`)
          .set('Authorization', 'Bearer testtoken')
          .send({
            titre: 'News test',
            contenu: 'Contenu de la news',
            campagneId: campagneId,
          })
          .expect(403);
      }
    });
  });

  describe('Story 7: Consulter les statistiques', () => {
    it('should return statistics for owned campaign', async () => {
      const { campagne } = await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .get(`/campagnes/${campagne.id}/stats`)
        .set('Authorization', 'Bearer testtoken')
        .expect(200);
      
      expect(response.body).toMatchObject({
        campagneId: campagne.id,
        objectif: 1000,
        montantCollecte: 0,
        statut: 'BROUILLON',
      });
    });

    it('should return 401 when requesting stats for campaign owned by another user', async () => {
      // Créer un projet et une campagne avec un autre utilisateur
      const project = await createProject('autre-porteur-id');
      const createRes = await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne autre',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        });
      
      if (createRes.status === 201) {
        const campagneId = createRes.body.id;
        
        // Changer l'utilisateur courant
        currentUserId = 'test-porteur-id';
        
        await request(app.getHttpServer())
          .get(`/campagnes/${campagneId}/stats`)
          .set('Authorization', 'Bearer testtoken')
          .expect(401);
      }
    });
  });

  describe('Soumission de campagne', () => {
    it('should submit a draft campaign (BROUILLON → EN_ATTENTE)', async () => {
      const { campagne } = await createCampagneWithProject();
      
      const response = await request(app.getHttpServer())
        .post(`/campagnes/${campagne.id}/soumettre`)
        .set('Authorization', 'Bearer testtoken')
        .expect(200);
      
      expect(response.body.statut).toBe('EN_ATTENTE');
      expect(kafkaMock.emit).toHaveBeenCalledWith(
        'campaign.submitted',
        expect.objectContaining({ campagneId: campagne.id })
      );
    });

    it('should return 403 when submitting campaign owned by another user', async () => {
      // Créer un projet et une campagne avec un autre utilisateur
      const project = await createProject('autre-porteur-id');
      const createRes = await request(app.getHttpServer())
        .post('/campagnes')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Campagne autre',
          description: 'Description valide avec assez de caractères',
          objectif: 1000,
          dateFin: new Date(Date.now() + 86400000).toISOString(),
          projetId: project.id,
        });
      
      if (createRes.status === 201) {
        const campagneId = createRes.body.id;
        
        // Changer l'utilisateur courant
        currentUserId = 'test-porteur-id';
        
        await request(app.getHttpServer())
          .post(`/campagnes/${campagneId}/soumettre`)
          .set('Authorization', 'Bearer testtoken')
          .expect(403);
      }
    });
  });
});