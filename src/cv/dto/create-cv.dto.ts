import { IsString, IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCvDto {
  @ApiProperty({ description: 'The last name of the person', example: 'Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'The first name of the person', example: 'John' })
  @IsString()
  firstname!: string;

  @ApiProperty({ description: 'The age of the person', example: 30 })
  @IsInt()
  @Min(0)
  age!: number;

  @ApiProperty({ description: 'National Identity Card (CIN) number', example: 'TN12345678' })
  @IsString()
  cin!: string;

  @ApiProperty({ description: 'Current job title', example: 'Software Engineer' })
  @IsString()
  job!: string;

  @ApiPropertyOptional({ description: 'File path or URL to the profile picture', example: '/images/profiles/johndoe.png' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ description: 'The ID of the user that owns this CV', example: 1 })
  @IsInt()
  userId!: number;

  @ApiPropertyOptional({ description: 'List of skill IDs associated with the CV', type: [Number], example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  skillIds?: number[];
}
