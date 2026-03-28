import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(30000);

describe('ProjectsController (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let currentUserId = 'test-porteur-id';

  class DynamicMockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      req.user = { sub: currentUserId };
      return true;
    }
  }

  const kafkaMock = {
    connect: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
  };

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('KafkaProducer')
      .useValue(kafkaMock)
      .overrideGuard(require('../src/auth/auth.guard').AuthGuard)
      .useClass(DynamicMockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

  describe('Story 1: Créer un projet', () => {
    it('should create a project with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Projet innovant',
          description: 'Description détaillée du projet avec au moins 10 caractères',
          photo: 'http://example.com/photo.jpg',
        })
        .expect(201);
      
      expect(response.body).toMatchObject({
        titre: 'Projet innovant',
        porteurId: 'test-porteur-id',
      });
    });

    it('should return 400 when titre is missing', async () => {
      await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          description: 'Description valide',
          photo: 'http://example.com/photo.jpg',
        })
        .expect(400);
    });

    it('should return 400 when photo is not a valid URL', async () => {
      await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Projet test',
          description: 'Description valide avec assez de caractères',
          photo: 'not-a-valid-url',
        })
        .expect(400);
    });
  });

  describe('Story 4: Consulter les projets', () => {
    it('should return empty array when no projects exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/projets')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return all projects', async () => {
      await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Projet 1',
          description: 'Description du projet 1 avec assez de caractères',
          photo: 'http://example.com/photo1.jpg',
        });
      
      await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Projet 2',
          description: 'Description du projet 2 avec assez de caractères',
          photo: 'http://example.com/photo2.jpg',
        });
      
      const response = await request(app.getHttpServer())
        .get('/projets')
        .expect(200);
      
      expect(response.body.length).toBe(2);
    });

    it('should get a project by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Projet test',
          description: 'Description valide avec assez de caractères',
          photo: 'http://example.com/photo.jpg',
        })
        .expect(201);
      
      const getRes = await request(app.getHttpServer())
        .get(`/projets/${createRes.body.id}`)
        .expect(200);
      
      expect(getRes.body.id).toBe(createRes.body.id);
    });

    it('should return 404 when project does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/projets/${uuidv4()}`)
        .expect(404);
    });
  });

  describe('Suppression de projet', () => {
    it('should delete a project without campaigns', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/projets')
        .set('Authorization', 'Bearer testtoken')
        .send({
          titre: 'Projet à supprimer',
          description: 'Description valide avec assez de caractères',
          photo: 'http://example.com/photo.jpg',
        })
        .expect(201);
      
      await request(app.getHttpServer())
        .delete(`/projets/${createRes.body.id}`)
        .set('Authorization', 'Bearer testtoken')
        .expect(204);
      
      await request(app.getHttpServer())
        .get(`/projets/${createRes.body.id}`)
        .expect(404);
    });
  });
});