import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Alarm } from '../alarms/entities/alarm.entity';
import { Partitioners } from 'kafkajs'; // 1. Bunu ekle

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Task, Alarm]),
    ClientsModule.registerAsync([
      {
        name: 'TASK_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => {
          const brokersRaw = config.get<string>('KAFKA_BROKERS');
          if (!brokersRaw) throw new Error('KAFKA_BROKERS environment variable is not set');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: config.get('KAFKA_CLIENT_ID') || 'tasks-client',
                brokers: brokersRaw.split(','),
              },
              producer: {
                createPartitioner: Partitioners.LegacyPartitioner,
              },
              consumer: {
                groupId: config.get('KAFKA_GROUP_ID') || 'tasks-group',
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}