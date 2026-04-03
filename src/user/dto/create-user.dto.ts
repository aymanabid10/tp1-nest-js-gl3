import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'The chosen username of the user', example: 'johndoe99' })
  @IsString()
  username!: string;

  @ApiProperty({ description: 'The active email address of the user', example: 'johndoe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'The password for the user account', example: 'strongPa$$word123' })
  @IsString()
  password!: string;
}
