import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResumeExtractionError } from './domain/errors';

@Catch(ResumeExtractionError)
export class ResumeExtractionErrorFilter implements ExceptionFilter {
  catch(error: ResumeExtractionError, host: ArgumentsHost): void {
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
    error: ResumeExtractionError,
  ):
    | BadRequestException
    | ConflictException
    | InternalServerErrorException
    | NotFoundException {
    switch (error.code) {
      case 'UNSUPPORTED_RESUME_FORMAT':
        return new BadRequestException(error.message);
      case 'RESUME_EXTRACTION_ALREADY_EXISTS':
        return new ConflictException(error.message);
      case 'RESUME_EXTRACTION_FAILED':
        return new InternalServerErrorException(error.message);
      case 'RESUME_NOT_FOUND':
        return new NotFoundException(error.message);
    }
  }
}
