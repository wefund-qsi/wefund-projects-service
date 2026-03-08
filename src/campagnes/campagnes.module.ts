import { Module } from '@nestjs/common';
import { CampagnesController } from './infrastructure/campagne.controller';
import { CampagnesService } from './application/campagnes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from 'src/projects/projects.module';
import { CampagneEntity } from './domain/campagne.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([CampagneEntity]),
    ProjectsModule
  ],
  controllers: [CampagnesController],
  providers: [CampagnesService],
  exports: [CampagnesService], 
})
export class CampagnesModule {}
