import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { StarterModule } from './starter/starter.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './common/s3/s3.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    StarterModule, PrismaModule, S3Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
