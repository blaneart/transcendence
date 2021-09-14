import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { OtherExceptionFilter } from './app.exception.filter';

const APP_SECRET: string = process.env.APP_SECRET;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));
  app.use(
    session({
      secret: APP_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // TODO change to true when we have https (if we have https)
    }),
  );
  app.useGlobalFilters(new OtherExceptionFilter());
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
