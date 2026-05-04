// Version: 1.0.1 - Triggering deploy with pnpm-workspace fix
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './modules/common/filters/http-exception.filter';

const parseAllowedOrigins = (): string[] => {
  const fromCorsOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromCorsOrigins && fromCorsOrigins.length > 0) {
    return fromCorsOrigins;
  }

  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = parseAllowedOrigins();

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('VetClinic API')
      .setDescription('API para el sistema de gestión de clínica veterinaria')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
  }
}

bootstrap();
