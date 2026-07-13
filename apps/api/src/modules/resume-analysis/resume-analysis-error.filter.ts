import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResumeAnalysisError } from './domain/errors';

@Catch(ResumeAnalysisError)
export class ResumeAnalysisErrorFilter implements ExceptionFilter {
  catch(error: ResumeAnalysisError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const exception = this.toHttpException(error);
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      code: error.code,
      message: error.message,
    });
  }

  private toHttpException(
    error: ResumeAnalysisError,
  ): ConflictException | InternalServerErrorException | NotFoundException | UnprocessableEntityException {
    switch (error.code) {
      case 'RESUME_NOT_FOUND':
      case 'RESUME_EXTRACTION_NOT_FOUND':
        return new NotFoundException(error.message);
      case 'RESUME_ANALYSIS_ALREADY_EXISTS':
      case 'RESUME_EXTRACTION_NOT_COMPLETED':
        return new ConflictException(error.message);
      case 'INVALID_RESUME_ANALYSIS_RESPONSE':
        return new UnprocessableEntityException(error.message);
      case 'RESUME_ANALYSIS_PROVIDER_FAILED':
        return new InternalServerErrorException(error.message);
    }
  }
}
