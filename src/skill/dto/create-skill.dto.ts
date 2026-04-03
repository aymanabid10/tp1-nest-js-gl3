import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ description: 'The name or designation of the skill', example: 'NestJS' })
  @IsString()
  designation!: string;
}
