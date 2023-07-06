import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'verbose', 'debug', 'log'],
  });

  // Create a Swagger document
  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Set up Swagger UI at a specific route
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
