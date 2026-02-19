import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './auth/jwt.strategy';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TasksModule } from './tasks/tasks.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HealthModule } from "./common/health/health.module";
import { 
  I18nModule, 
  AcceptLanguageResolver, 
  HeaderResolver, 
  QueryResolver, 
  I18nValidationPipe,  
} from 'nestjs-i18n';
import { APP_PIPE } from '@nestjs/core';
import * as path from 'path';
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
      imports: [ConfigModule],
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
        entities: [__dirname + '/**/*.entity{.ts,.js}'], 
        synchronize: false,
        migrationsRun: true,
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}