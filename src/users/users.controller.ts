import { Controller, Post, Body, Get, Delete, Param,UseGuards,UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
@Controller('users')
export class UsersController {
constructor(private usersService: UsersService) {}

@Post()
create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto.email, createUserDto.password);
}
@Get()
findAll() {
    return this.usersService.findAll();
}
@UseGuards(AuthGuard('jwt'))
@Delete(':id')
delete(@Param('id') id: string) { 
    return this.usersService.delete(+id);
}
}