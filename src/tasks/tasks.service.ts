import { Injectable, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ClientKafka } from '@nestjs/microservices';
import { Alarm } from '../alarms/entities/alarm.entity';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    
    @InjectRepository(Alarm)
    private alarmRepo: Repository<Alarm>,
    
    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache,
    
    @Inject('TASK_SERVICE') 
    private readonly kafkaClient: ClientKafka,
  ) {}
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private getCacheKey(userId: number): string {
    return `tasks_user_${userId}`;
  }
  async create(createTaskDto: CreateTaskDto, userId: number) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId } as any,
    });
    const savedTask = await this.taskRepository.save(task);
    
    await this.cacheManager.del(this.getCacheKey(userId));

    this.kafkaClient.emit('task.created', {
      taskId: savedTask.id,
      title: savedTask.title,
      userId: userId,
      timestamp: new Date().toISOString()
    });
    return savedTask;
  }

  async findAll(userId: number) {
    const cacheKey = this.getCacheKey(userId);
    const cachedTasks = await this.cacheManager.get(cacheKey);
    
    if (cachedTasks) {
      return cachedTasks;
    }

    const tasks = await this.taskRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    await this.cacheManager.set(cacheKey, tasks, 600000);
    
    return tasks;
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!task) throw new NotFoundException('Görev bulunamadı veya bu yetkiye sahip değilsiniz!');
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id, userId);
    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    await this.cacheManager.del(this.getCacheKey(userId));

    this.kafkaClient.emit('task.updated', { 
      taskId: id, 
      userId, 
      title: updatedTask.title,
      timestamp: new Date().toISOString() 
    });
    
    return updatedTask;
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);

    await this.cacheManager.del(this.getCacheKey(userId));

    this.kafkaClient.emit('task.removed', { 
        taskId: id, 
        userId,
        timestamp: new Date().toISOString() 
    });
    
    return { message: 'Görev başarıyla silindi' };
  }

  async saveAlarm(payload: any, type: string) {
    const alarm = this.alarmRepo.create({
      type: type,
      userId: payload.userId,
      payload: payload,
    });
    
    await this.alarmRepo.save(alarm);
  }
}