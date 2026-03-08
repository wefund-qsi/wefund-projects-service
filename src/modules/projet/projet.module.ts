import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetController } from './projet.controller';
import { ProjetService } from './projet.service';
import { ProjetEntity } from './entities/projet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjetEntity])],
  controllers: [ProjetController],
  providers: [ProjetService],
  exports: [ProjetService],
})
export class ProjetModule {}
