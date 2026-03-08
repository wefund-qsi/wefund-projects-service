import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('projets')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    // Récupérer le porteurId depuis le token JWT
    const porteurId = req.user.sub;
    
    return await this.projectsService.create(createProjectDto, porteurId);
  }
}