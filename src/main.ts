import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import helmet from 'helmet';
import { AllExceptionsFilter } from './utils/errorHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      whitelist: true,
      exceptionFactory: (error: ValidationError[]) => {
        let errorResponse = {
          message: 'Error Validation',
          error: {},
        };
        error.forEach((err) => {
          errorResponse.error[err.property] = Object.values(err.constraints);
        });
        return new BadRequestException(errorResponse);
      },
    }),
  );
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await app.listen(3000);
}
bootstrap();
