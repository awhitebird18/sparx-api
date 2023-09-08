import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// import { SpelunkerModule } from 'nestjs-spelunker';
import * as https from 'https';

import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  let httpsOptions = {};

  if (isProduction) {
    httpsOptions = {
      key: readFileSync('/app/key.pem'),
      cert: readFileSync('/app/cert.pem'),
    };
  }
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use('/static', express.static(join(__dirname, '..', 'static')));
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

  await app.init();
  if (isProduction) {
    https.createServer(httpsOptions, server).listen(3000);
  } else {
    app.listen(3000);
  }
}
bootstrap();
