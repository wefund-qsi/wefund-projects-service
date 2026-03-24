import { Module } from '@nestjs/common';
import { CampagnesController } from './infrastructure/campagne.controller';
import { CampagnesService } from './application/campagnes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { CampagneEntity } from './domain/campagne.entity';
import { NewsEntity } from './domain/news.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';



@Module({
  imports: [
    TypeOrmModule.forFeature([CampagneEntity, NewsEntity]),
    ProjectsModule,
        ClientsModule.register([
      {
        name: 'KafkaProducer',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'wefund-projects-service',
            brokers: ['redpanda:9092'],
          },
          consumer: {
            groupId: 'wefund-projects-service-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [CampagnesController],
  providers: [CampagnesService],
  exports: [CampagnesService], 
})
export class CampagnesModule {}
