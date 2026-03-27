import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './infrastructure/projects.controller';
import { ProjectsService } from './application/projects.service';
import { ProjectEntity } from './infrastructure/project.entity';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, AuthGuard],
  exports: [ProjectsService], 
})
export class ProjectsModule {}