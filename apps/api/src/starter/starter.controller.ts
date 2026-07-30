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
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { StarterService } from './starter.service';
import { Prisma, StarterRecord } from '@repo/database';
import { SearchQuery, StarterFilterResponse } from '@repo/api';
import { FileInterceptor } from '@nestjs/platform-express/multer';

@Controller('starter')
export class StarterController {
    constructor(private readonly starterService: StarterService) { }

    @Post('seed')
    seed(@Body('folderPath') folderPath: string) {
        return this.starterService.importFromFolder(folderPath);
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

    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /(pdf|png|jpg|jpeg)$/i }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.starterService.uploadRecordFile(id, file);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<StarterRecord> {
        return await this.starterService.remove(id);
    }
}
