import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  CandidateProfileResponse,
  candidateProfileUpsertSchema,
  candidateSkillCreateSchema,
  candidateSkillUpdateSchema,
  experienceCreateSchema,
  experienceUpdateSchema,
} from '@job-pilot/shared';
import { ZodError, ZodSchema } from 'zod';
import { CandidateProfileService } from './candidate-profile.service';
import { CandidateProfileError } from './domain/errors';

@Controller('candidate-profile')
export class CandidateProfileController {
  constructor(private readonly service: CandidateProfileService) {}

  @Get()
  async getProfile(): Promise<CandidateProfileResponse> {
    return this.handle(() => this.service.getCurrentProfile());
  }

  @Put()
  async upsertProfile(@Body() body: unknown): Promise<CandidateProfileResponse> {
    const input = this.parse(candidateProfileUpsertSchema, body);
    return this.handle(() => this.service.upsertCurrentProfile(input));
  }

  @Post('experiences')
  async createExperience(@Body() body: unknown): Promise<CandidateProfileResponse> {
    const input = this.parse(experienceCreateSchema, body);
    return this.handle(() => this.service.createExperience(input));
  }

  @Put('experiences/:experienceId')
  async updateExperience(
    @Param('experienceId') experienceId: string,
    @Body() body: unknown,
  ): Promise<CandidateProfileResponse> {
    const input = this.parse(experienceUpdateSchema, body);
    return this.handle(() => this.service.updateExperience(experienceId, input));
  }

  @Delete('experiences/:experienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExperience(@Param('experienceId') experienceId: string): Promise<void> {
    await this.handle(() => this.service.deleteExperience(experienceId));
  }

  @Post('skills')
  async addSkill(@Body() body: unknown): Promise<CandidateProfileResponse> {
    const input = this.parse(candidateSkillCreateSchema, body);
    return this.handle(() => this.service.addSkill(input));
  }

  @Put('skills/:candidateSkillId')
  async updateSkill(
    @Param('candidateSkillId') candidateSkillId: string,
    @Body() body: unknown,
  ): Promise<CandidateProfileResponse> {
    const input = this.parse(candidateSkillUpdateSchema, body);
    return this.handle(() => this.service.updateSkill(candidateSkillId, input));
  }

  @Delete('skills/:candidateSkillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(@Param('candidateSkillId') candidateSkillId: string): Promise<void> {
    await this.handle(() => this.service.deleteSkill(candidateSkillId));
  }

  private parse<T>(schema: ZodSchema<T>, body: unknown): T {
    try {
      return schema.parse(body);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new CandidateProfileError(
          'INVALID_INPUT',
          error.issues.map((issue) => issue.message).join('; '),
        );
      }

      throw error;
    }
  }

  private async handle<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof CandidateProfileError) {
        throw error;
      }

      throw error;
    }
  }
}
