import {
  ValidationPipe,
  UsePipes,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import type { AuthenticatedRequest } from './middlewares/auth-user.middleware';

@Controller('cv')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthenticatedRequest) {
    return this.cvService.create({ ...createCvDto, userId: req.userId });
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
  async update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const existingCv = await this.cvService.findOne(+id);

    if (existingCv.user.id !== req.userId) {
      throw new ForbiddenException();
    }

    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const existingCv = await this.cvService.findOne(+id);

    if (existingCv.user.id !== req.userId) {
      throw new ForbiddenException();
    }

    return this.cvService.remove(+id);
  }
}
