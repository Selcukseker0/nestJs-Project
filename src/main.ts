import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: configService.get<string>('KAFKA_BROKERS')?.split(',') || ['localhost:9092'],
      },
      consumer: {
        groupId: configService.get<string>('KAFKA_GROUP_ID') || 'tasks-group',
        sessionTimeout: 6000,   
        heartbeatInterval: 2000,
        rebalanceTimeout: 10000,
      },
    },
  });

 
  app.useGlobalInterceptors(new TransformInterceptor());


  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Project API')
    .setDescription('i18n Supported API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}`);
}
bootstrap();