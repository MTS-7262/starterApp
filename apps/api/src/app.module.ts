import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { StarterModule } from './starter/starter.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import path from 'path';

@Module({
  imports: [
    LinksModule, StarterModule, PrismaModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
