import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CvHistoryResponseDto } from '../../application/dtos/cv-history-response.dto';
import { GetCvHistoryUseCase } from '../../application/use-cases/get-cv-history.use-case';

@ApiTags('CV History')
@Controller('cv-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CvHistoryController {
  constructor(private readonly getCvHistoryUseCase: GetCvHistoryUseCase) {}

  @Get()
  findAll(): Promise<CvHistoryResponseDto[]> {
    return this.getCvHistoryUseCase.execute();
  }

  @Get(':cvId')
  findByCvId(@Param('cvId') cvId: string): Promise<CvHistoryResponseDto[]> {
    return this.getCvHistoryUseCase.execute(cvId);
  }
}
