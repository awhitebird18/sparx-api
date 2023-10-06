import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './common/filters/sentry.filter';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const appOptions = { bufferLogs: true };

  const app = await NestFactory.create(AppModule, appOptions);

  app.useLogger(app.get(Logger));

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  if (isProduction) {
    appOptions['httpsOptions'] = {
      key: readFileSync('/etc/letsencrypt/live/api.spa-rx.ca/privkey.pem'),
      cert: readFileSync('/etc/letsencrypt/live/api.spa-rx.ca/fullchain.pem'),
    };
  }

  // Global error handling
  Sentry.init({
    dsn: process.env.SENTRY_DNS,
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  // Create a Swagger document
  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: [
      process.env.CLIENT_BASE_URL,
      'https://awhitebird.ca',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
