import { Injectable, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ClientKafka } from '@nestjs/microservices'; // Kafka Client'ı ekledik

@Injectable()
export class TasksService implements OnModuleInit { // OnModuleInit ekledik
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // Modülde tanımladığımız ismi buraya enjekte ediyoruz
    @Inject('TASK_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  // Uygulama başlarken Kafka broker'ına el sıkışmaya git
  async onModuleInit() {
    await this.kafkaClient.connect();
    console.log('📡 Kafka Producer Bağlantısı Kuruldu!');
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
    
    // Redis temizliği
    await this.cacheManager.del(this.getCacheKey(userId));

    // KAFKA: Görev oluşturuldu mesajını fırlat
    this.kafkaClient.emit('task.created', {
      taskId: savedTask.id,
      title: savedTask.title,
      userId: userId,
      timestamp: new Date().toISOString()
    });
    console.log('📨 Kafka: task.created mesajı fırlatıldı!');

    return savedTask;
  }

  async findAll(userId: number) {
    const cacheKey = this.getCacheKey(userId);
    const cachedTasks = await this.cacheManager.get(cacheKey);
    if (cachedTasks) {
      console.log('🚀 Veriler REDIS üzerinden getirildi!');
      return cachedTasks;
    }

    const tasks = await this.taskRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    await this.cacheManager.set(cacheKey, tasks, 600000);
    console.log('📦 Veriler DB üzerinden getirildi ve Redis\'e yazıldı.');
    
    return tasks;
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!task) throw new NotFoundException('Görev bulunamadı!');
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id, userId);
    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    await this.cacheManager.del(this.getCacheKey(userId));

    // KAFKA: Güncelleme olayını bildir
    this.kafkaClient.emit('task.updated', { taskId: id, userId });
    
    return updatedTask;
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);

    await this.cacheManager.del(this.getCacheKey(userId));

    // KAFKA: Silme olayını bildir
    this.kafkaClient.emit('task.removed', { taskId: id, userId });
    
    return { message: 'Görev başarıyla silindi' };
  }
}