import { Controller, Post, Get, Delete,HttpCode, HttpStatus, Body,Param } from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';

@Controller('projets')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    // Simulation du porteurId 
    const mockPorteurId = "cm9x8y7z6w5v4u3t2s1r0q"; 
    
    return await this.projectsService.create(createProjectDto, mockPorteurId);
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