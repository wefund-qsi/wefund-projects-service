import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampagneController } from './campagne.controller';
import { CampagneService } from './campagne.service';
import { CampagneEntity } from './entities/campagne.entity';
import { ProjetModule } from '../projet/projet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CampagneEntity]),
    ProjetModule,
  ],
  controllers: [CampagneController],
  providers: [CampagneService],
  exports: [CampagneService],
})
export class CampagneModule {}
