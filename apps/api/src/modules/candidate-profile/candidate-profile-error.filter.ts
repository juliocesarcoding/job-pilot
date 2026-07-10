import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CandidateProfileError } from './domain/errors';

@Catch(CandidateProfileError)
export class CandidateProfileErrorFilter implements ExceptionFilter {
  catch(error: CandidateProfileError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const exception = this.toHttpException(error);
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      code: error.code,
      message: error.message,
    });
  }

  private toHttpException(error: CandidateProfileError): BadRequestException | NotFoundException | ConflictException {
    switch (error.code) {
      case 'INVALID_INPUT':
        return new BadRequestException(error.message);
      case 'DUPLICATE_CANDIDATE_SKILL':
        return new ConflictException(error.message);
      case 'USER_NOT_FOUND':
      case 'PROFILE_NOT_FOUND':
      case 'RESOURCE_NOT_FOUND':
        return new NotFoundException(error.message);
    }
  }
}
