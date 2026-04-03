import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @IsString()
  username!: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password', example: 'SecurePass123!' })
  @IsString()
  password!: string;
}
