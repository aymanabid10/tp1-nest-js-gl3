import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  memberIds: number[];
}
