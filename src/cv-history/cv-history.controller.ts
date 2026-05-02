import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CvHistoryResponseDto } from './dto/cv-history-response.dto';
import { CvHistoryService } from './cv-history.service';

@ApiTags('CV History')
@Controller('cv-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CvHistoryController {
  constructor(private readonly cvHistoryService: CvHistoryService) {}

  @Get()
  findAll(): Promise<CvHistoryResponseDto[]> {
    return this.cvHistoryService.findAll();
  }

  @Get(':cvId')
  findByCvId(
    @Param('cvId', ParseIntPipe) cvId: number,
  ): Promise<CvHistoryResponseDto[]> {
    return this.cvHistoryService.findByCvId(cvId);
  }
}
