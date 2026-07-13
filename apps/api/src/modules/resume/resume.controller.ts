import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ResumeResponse } from '@job-pilot/shared';
import { ResumeService } from './resume.service';

interface UploadedResumeMultipartFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('resumes')
export class ResumeController {
  constructor(private readonly service: ResumeService) {}

  @Get()
  async listResumes(): Promise<ResumeResponse[]> {
    return this.service.listResumes();
  }

  @Get('active')
  async getActiveResume(): Promise<ResumeResponse> {
    return this.service.getActiveResume();
  }

  @Get(':id/download')
  @Header('Content-Type', 'application/octet-stream')
  async downloadResume(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const download = await this.service.downloadResume(id);

    response.set({
      'Content-Type': download.resume.mimeType,
      'Content-Disposition': `attachment; filename="${download.resume.originalFileName}"`,
      'Content-Length': download.resume.fileSize.toString(),
    });

    return new StreamableFile(download.stream);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file?: UploadedResumeMultipartFile): Promise<ResumeResponse> {
    return this.service.uploadResume(
      file
        ? {
            originalFileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            buffer: file.buffer,
          }
        : undefined,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResume(@Param('id') id: string): Promise<void> {
    await this.service.deleteResume(id);
  }
}
