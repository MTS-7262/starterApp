import { Module } from '@nestjs/common';
import { StarterService } from './starter.service';
import { StarterController } from './starter.controller';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  providers: [StarterService],
  controllers: [StarterController],
  imports: [S3Module],
})
export class StarterModule {}
