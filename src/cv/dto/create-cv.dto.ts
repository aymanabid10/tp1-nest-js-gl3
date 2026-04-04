import { IsString, IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCvDto {
  @ApiProperty({ description: 'Last name of the CV owner', example: 'Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'First name of the CV owner', example: 'John' })
  @IsString()
  firstname!: string;

  @ApiProperty({ description: 'Age of the CV owner', example: 25, minimum: 0 })
  @IsInt()
  @Min(0)
  age!: number;

  @ApiProperty({ description: 'National ID number', example: 'TN12345678' })
  @IsString()
  cin!: string;

  @ApiProperty({ description: 'Job title', example: 'Software Engineer' })
  @IsString()
  job!: string;

  @ApiPropertyOptional({
    description: 'Path to CV file or image',
    example: '/uploads/cv.pdf',
  })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({
    description: 'Array of skill IDs',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  skillIds?: number[];
}
