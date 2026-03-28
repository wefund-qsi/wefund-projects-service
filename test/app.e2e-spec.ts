
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ClientKafka } from '@nestjs/microservices';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // Mock minimal de ClientKafka
  const kafkaMock = {
    connect: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('KafkaProducer')
      .useValue(kafkaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
