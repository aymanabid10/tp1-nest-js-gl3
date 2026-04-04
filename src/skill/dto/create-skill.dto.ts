import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Skill name or designation',
    example: 'JavaScript',
  })
  @IsString()
  designation!: string;
}
