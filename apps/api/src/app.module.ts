import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { StarterModule } from './starter/starter.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ StarterModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
