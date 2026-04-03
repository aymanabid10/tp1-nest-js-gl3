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
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@ApiTags('CV')
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CV' })
  @ApiResponse({ status: 201, description: 'CV successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CVs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'List of CVs with pagination metadata' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.cvService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a CV by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'CV ID' })
  @ApiResponse({ status: 200, description: 'CV found' })
  @ApiResponse({ status: 404, description: 'CV not found' })
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CV by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'CV ID' })
  @ApiResponse({ status: 200, description: 'CV successfully updated' })
  @ApiResponse({ status: 404, description: 'CV not found' })
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a CV by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'CV ID' })
  @ApiResponse({ status: 200, description: 'CV successfully deleted' })
  @ApiResponse({ status: 404, description: 'CV not found' })
  remove(@Param('id') id: string) {
    return this.cvService.remove({ id: +id });
  }
}

