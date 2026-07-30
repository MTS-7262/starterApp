import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { StarterService } from './starter.service';
import { Prisma, StarterRecord } from '@repo/database';
import { SearchQuery, StarterFilterResponse } from '@repo/api';

@Controller('starter')
export class StarterController {
    constructor(private readonly starterService: StarterService) { }

    @Post('seed')
    seed(@Body('filePath') filePath: string) {
        return this.starterService.importCsvFromPath(filePath);
    }

    @Post('filter')
    async filter(@Body() query: SearchQuery): Promise<StarterFilterResponse> {
        return await this.starterService.filter(query);
    }

    @Post()
    async create(@Body() data: Prisma.StarterRecordCreateInput): Promise<StarterRecord> {
        return await this.starterService.create(data);
    }

    @Get()
   async findAll(): Promise<StarterRecord[]> {
        return await this.starterService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<StarterRecord> {
        return await this.starterService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() data: Prisma.StarterRecordUpdateInput,
    ): Promise<StarterRecord> {
        return await this.starterService.update(id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<StarterRecord> {
        return await this.starterService.remove(id);
    }
}
