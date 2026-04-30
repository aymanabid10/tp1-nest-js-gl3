import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReactMessageDto {
  @IsNumber()
  @IsNotEmpty()
  messageId: number;

  @IsString()
  @IsNotEmpty()
  emoji: string;
}
