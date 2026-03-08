import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetModule } from './modules/projet/projet.module';
import { databaseConfig } from './config/database.config';
import { CampagneModule } from './modules/campagne/campagne.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    ProjetModule,
    CampagneModule
  ],
})
export class AppModule {}
