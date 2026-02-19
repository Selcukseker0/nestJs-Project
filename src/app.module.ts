import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { JwtStrategy } from './auth/jwt.strategy';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HealthModule } from "./common/health/health.module";
import { Alarm } from './alarms/entities/alarm.entity';
import { 
  I18nModule, 
  AcceptLanguageResolver, 
  HeaderResolver, 
  QueryResolver, 
  I18nValidationPipe, 
  I18nValidationExceptionFilter 
} from 'nestjs-i18n';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import * as path from 'path';

// Redis store için
import Keyv from 'keyv';
const KeyvRedis = require('keyv-redis');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule, HealthModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        stores: [
          new Keyv({
            store: new KeyvRedis(config.get('REDIS_URL')),
            namespace: 'tasks',
          }),
        ],
      }),
    }),
    UsersModule,
    AuthModule,
    TasksModule,
    HealthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')) || 5432,
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [User, Task, Alarm],
        synchronize: config.get('DB_SYNC') === 'true',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    JwtStrategy,
    {
      provide: APP_PIPE,
      useClass: I18nValidationPipe,
    },
    {
      provide: APP_FILTER,
      useFactory: () => {
        return new I18nValidationExceptionFilter({
          detailedErrors: true,
        });
      },
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}