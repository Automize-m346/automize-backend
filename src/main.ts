import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: false,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const basePort = Number(process.env.PORT ?? 4000);
  const maxAttempts = 5;
  let lastError: any = null;

  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    try {
      await app.listen(port, '0.0.0.0');
      console.log(`Server listening on port ${port}`);
      lastError = null;
      break;
    } catch (err: any) {
      lastError = err;
      if (err?.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use, trying ${basePort + i + 1}...`);
      } else {
        throw err;
      }
    }
  }

  if (lastError) {
    console.error(`Failed to bind to ports ${basePort}-${basePort + maxAttempts - 1}`);
    throw lastError;
  }
}
bootstrap();
