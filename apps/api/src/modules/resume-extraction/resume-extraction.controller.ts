import { Controller, Get, Param, Post } from '@nestjs/common';
import { ResumeExtractionResponseDto } from './dto/resume-extraction-response.dto';
import { ResumeExtractionService } from './resume-extraction.service';

@Controller('resumes/:resumeId')
export class ResumeExtractionController {
  constructor(private readonly service: ResumeExtractionService) {}

  @Post('extract')
  async extractResume(@Param('resumeId') resumeId: string): Promise<ResumeExtractionResponseDto> {
    return this.service.extractResume(resumeId);
  }

  @Get('extraction')
  async getExtraction(@Param('resumeId') resumeId: string): Promise<ResumeExtractionResponseDto> {
    return this.service.getExtraction(resumeId);
  }
}
