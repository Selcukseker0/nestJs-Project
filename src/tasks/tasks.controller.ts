import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni görev oluştur' })
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm görevleri listele' })
  findAll(@Req() req) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Belirli bir görevi getir' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Görevi güncelle' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req) {
    return this.tasksService.update(+id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Görevi sil' })
  remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(+id, req.user.userId);
  }

  @EventPattern('task.created')
async handleCreated(@Payload() data: any) {
  await this.tasksService.saveAlarm(data, 'TASK_CREATED');
}

@EventPattern('task.updated')
async handleUpdated(@Payload() data: any) {
  await this.tasksService.saveAlarm(data, 'TASK_UPDATED');
}

@EventPattern('task.removed')
async handleRemoved(@Payload() data: any) {
  await this.tasksService.saveAlarm(data, 'TASK_REMOVED');
}
}