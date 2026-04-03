import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@ApiTags('Skill')
@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({ status: 201, description: 'Skill successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'List of skills with pagination metadata' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.skillService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a skill by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill found' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a skill by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill successfully updated' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(+id, updateSkillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a skill by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill successfully deleted' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  remove(@Param('id') id: string) {
    return this.skillService.remove({ id: +id });
  }
}
