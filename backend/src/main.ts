/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConsoleLogger } from '@nestjs/common';
import { dump } from 'js-yaml';
import * as fs from 'fs';
import { ApikeyGuard } from './api-key/api-key.guard';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'MonAmiChef',
      logLevels: ['log', 'debug', 'error', 'warn'],
    }),
  });

  app.useGlobalGuards(new ApikeyGuard());

  app.use(helmet());

  const configBuilder = new DocumentBuilder()
    .setTitle('MonAmiChef')
    .setDescription('The MonAmiChef API documentation')
    .addServer('https://api.monamichef.com', 'Production server')
    .addServer('http://localhost:8888', 'Local dev')
    .setVersion('1.0');

  if (process.env.NODE_ENV === 'development') {
    configBuilder
      .addApiKey(
        { type: 'apiKey', name: 'x-api-key', in: 'header' },
        'X-API-KEY',
      )
      .addSecurityRequirements('X-API-KEY');
  }

  const config = configBuilder.build();

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || '*';

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const yamlString = dump(document, { skipInvalid: true });
  fs.writeFileSync('./openapi.yaml', yamlString);

  const port = process.env.PORT || 8888;

  await app.listen(port);

  console.log(`Application is running on port: ${port}`);
}
bootstrap();
