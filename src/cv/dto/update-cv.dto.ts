import { PartialType } from '@nestjs/swagger';
import { CreateCvDto } from './create-cv.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCvDto extends PartialType(CreateCvDto) {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  firstname?: string;

  @ApiPropertyOptional()
  age?: number;

  @ApiPropertyOptional()
  cin?: string;

  @ApiPropertyOptional()
  job?: string;

  @ApiPropertyOptional()
  path?: string;

  @ApiPropertyOptional()
  userId?: number;

  @ApiPropertyOptional({ type: [Number] })
  skillIds?: number[];
}
