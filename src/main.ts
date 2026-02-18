import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  const configService = app.get(ConfigService);
  try {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth Project API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
  catch (err) {
    // If swagger setup fails (version mismatch), don't crash the app
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.warn('Swagger setup skipped:', err && err.message ? err.message : err);
  }
  await app.listen(process.env.PORT ?? configService.get('PORT') ?? 3000);
}
bootstrap();
