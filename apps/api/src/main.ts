import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

(BigInt.prototype as any).toJSON = function () {
  const intValue = Number(this);
  return Number.isSafeInteger(intValue) ? intValue : this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  await app.listen(3000);
}

void bootstrap();
