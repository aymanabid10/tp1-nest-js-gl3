import { ValidationPipe, UsePipes,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ValidationPipe, UsePipes, CvService } from './cv.service';
import { ValidationPipe, UsePipes, CreateCvDto } from './dto/create-cv.dto';
import { ValidationPipe, UsePipes, UpdateCvDto } from './dto/update-cv.dto';

@Controller('cv')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvService.remove(+id);
  }
}

