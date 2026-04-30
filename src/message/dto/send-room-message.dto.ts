import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendRoomMessageDto {
  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  replyToId?: number;
}
