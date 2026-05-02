import {
  ValidationPipe,
  UsePipes,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface';
import { Role } from 'src/shared/enums/role.enum';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@ApiTags('CV')
@Controller('cv')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthenticatedRequest) {
    return this.cvService.createForOwner(createCvDto, req.user.sub);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (page !== undefined || limit !== undefined) {
      return this.cvService.findAllForUserPaginated(
        req.user,
        paginationDto.page,
        paginationDto.limit,
      );
    }

    return this.cvService.findAllForUser(req.user);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Req() req: AuthenticatedRequest) {
    return this.cvService.findAllForUser(req.user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cvService.findOneForUser(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cvService.updateForUser(id, updateCvDto, req.user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cvService.removeForUser(id, req.user);
  }
}
