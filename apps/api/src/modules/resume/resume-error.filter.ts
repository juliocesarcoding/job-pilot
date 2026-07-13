import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResumeError } from './domain/errors';

@Catch(ResumeError)
export class ResumeErrorFilter implements ExceptionFilter {
  catch(error: ResumeError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const exception = this.toHttpException(error);
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      code: error.code,
      message: error.message,
    });
  }

  private toHttpException(error: ResumeError): BadRequestException | NotFoundException | ConflictException {
    switch (error.code) {
      case 'INVALID_RESUME_UPLOAD':
        return new BadRequestException(error.message);
      case 'RESUME_DELETE_NOT_ALLOWED':
        return new ConflictException(error.message);
      case 'CANDIDATE_PROFILE_NOT_FOUND':
      case 'RESUME_NOT_FOUND':
        return new NotFoundException(error.message);
    }
  }
}
