import { Controller, Post, Body, Get, Delete, Param,UseGuards,Req } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
@Controller('users')
export class UsersController {
constructor(private usersService: UsersService) {}

@Post()
async create(@Body() createUserDto: CreateUserDto, @I18n() i18n: I18nContext) {
    const user = await this.usersService.create(createUserDto.email, createUserDto.password);
    return {
        message: await i18n.translate('user.created'),
        data: user,
    };
}
@Get()
async findAll(@I18n() i18n: I18nContext) {
    const users = await this.usersService.findAll();
    return {
        message: await i18n.translate('user.all_listed'),
        data: users,
    };
}
@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Delete(':id')
@ApiOperation({ summary: 'Kullanıcı sil' })
@ApiParam({ name: 'id', type: Number, example: 1 })
async delete(@Param('id') id: string, @I18n() i18n: I18nContext) {
    await this.usersService.delete(+id);
    return {
        message: await i18n.translate('user.deleted'),
    };
}
}