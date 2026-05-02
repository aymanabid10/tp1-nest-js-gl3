import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  replyToId?: number;
}
