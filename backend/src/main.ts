import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe for strict DTO checking
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend dashboard access
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Setup Swagger / OpenAPI documentation for Internal Platform DX
  const config = new DocumentBuilder()
    .setTitle('AI Evaluation Task Manager API')
    .setDescription('Internal platform REST API for assigning and executing AI model evaluations.')
    .setVersion('1.0')
    .addTag('tasks', 'Management and lifecycle of AI evaluation tasks')
    .addTag('evaluations', 'AI evaluation submissions and ratings')
    .addTag('users', 'Internal evaluators and admins management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger API docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
