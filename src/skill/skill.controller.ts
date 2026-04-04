import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({ status: 200, description: 'List of skills' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (page !== undefined || limit !== undefined) {
      return this.skillService.findAllPaginated(
        paginationDto.page,
        paginationDto.limit,
      );
    }

    return this.skillService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a skill by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill found' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a skill by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill successfully updated' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a skill by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill successfully deleted' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.remove(id);
  }
}
