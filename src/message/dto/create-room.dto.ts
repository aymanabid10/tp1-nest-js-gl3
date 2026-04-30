import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['private', 'group'])
  type: 'private' | 'group';

  @IsArray()
  @IsNumber({}, { each: true })
  memberIds: number[];
}
