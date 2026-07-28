import { Module } from '@nestjs/common';
import { StarterService } from './starter.service';
import { StarterController } from './starter.controller';

@Module({
  providers: [StarterService],
  controllers: [StarterController]
})
export class StarterModule {}
