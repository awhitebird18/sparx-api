import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// import { SpelunkerModule } from 'nestjs-spelunker';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const appOptions = { bufferLogs: true };

  if (isProduction) {
    appOptions['httpsOptions'] = {
      key: readFileSync('/etc/letsencrypt/live/api.spa-rx.ca/privkey.pem'),
      cert: readFileSync('/etc/letsencrypt/live/api.spa-rx.ca/fullchain.pem'),
    };
  }

  const app = await NestFactory.create(AppModule, appOptions);

  // const tree = SpelunkerModule.explore(app);
  // const root = SpelunkerModule.graph(tree);
  // const edges = SpelunkerModule.findGraphEdges(root);
  // const mermaidEdges = edges.map(
  //   ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
  // );
  // console.info(mermaidEdges.join('\n'));

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     validationError: { target: false },
  //   }),
  // );

  app.useLogger(app.get(Logger));

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

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
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
