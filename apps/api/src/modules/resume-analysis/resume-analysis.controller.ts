import { Controller, Get, Param, Post } from '@nestjs/common';
import { ResumeAnalysisResponseDto } from './dto/resume-analysis-response.dto';
import { ResumeAnalysisService } from './resume-analysis.service';

@Controller('resumes/:resumeId')
export class ResumeAnalysisController {
  constructor(private readonly service: ResumeAnalysisService) {}

  @Post('analyze')
  async analyzeResume(@Param('resumeId') resumeId: string): Promise<ResumeAnalysisResponseDto> {
    return this.service.analyzeResume(resumeId);
  }

  @Get('analysis')
  async getAnalysis(@Param('resumeId') resumeId: string): Promise<ResumeAnalysisResponseDto> {
    return this.service.getAnalysis(resumeId);
  }
}
