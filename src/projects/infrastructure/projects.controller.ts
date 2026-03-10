import { Controller, Post, Get, Delete,HttpCode, HttpStatus, Body,Param,UseGuards, Request } from '@nestjs/common';
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

  @Get()
  async findAll() {
    return await this.projectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.projectsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
  }
}