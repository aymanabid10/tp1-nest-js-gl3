import { ValidationPipe, UsePipes, Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ValidationPipe, UsePipes, UserService } from './user.service';
import { ValidationPipe, UsePipes, CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe, UsePipes, UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

